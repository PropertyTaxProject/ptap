from dataclasses import dataclass
from typing import List, Optional, Tuple

from geoalchemy2.functions import ST_DistanceSphere
from sqlalchemy import Integer, func, literal_column
from sqlalchemy.orm import aliased

from . import db
from .constants import METERS_IN_MILE
from .models import ParcelType
from .utils import model_from_region


@dataclass
class ComparableParameters:
    age_diff: float
    distance: float
    sales: bool
    floor_diff: Optional[float] = None
    build_diff: Optional[float] = None
    land_diff: Optional[float] = None
    sq_ft_diff: Optional[float] = None


def find_comparables(
    region: str, target: ParcelType, multiplier: float = 4
) -> List[Tuple[ParcelType, float]]:
    model = model_from_region(region)
    comparable_params = _region_parameters(region, multiplier, None)

    # Not using a query for the absolute value on the diff so that we can take advantage
    # of the compound index scan, which isn't triggered for abs()
    query_filters = [
        model.pin != target.pin,
        *_min_max_query(model, "age", int, target.age, comparable_params.age_diff),
    ]

    if comparable_params.sales:
        query_filters.extend(
            [
                model.sale_price is not None,
                model.sale_price
                <= (target.assessed_value or 0) * 3 + 1000 * multiplier,
                model.sale_year >= 2019,
                model.sale_price > 500,
            ]
        )

    # TODO: Clean up this chunk
    if region == "detroit":
        query_filters.extend(
            [
                *_min_max_query(
                    model,
                    "total_floor_area",
                    float,
                    target.total_floor_area,
                    comparable_params.floor_diff,
                ),
                model.exterior == (target.exterior or 0),
            ]
        )
    elif region == "cook":
        prop_class = target.property_class
        one_story_classes = ["202", "203", "204"]
        two_story_classes = ["205", "206", "207", "208", "209"]
        prop_class_query = model.property_class == prop_class
        if prop_class in one_story_classes:
            prop_class_query = model.property_class.in_(one_story_classes)
        if prop_class in two_story_classes:
            prop_class_query = model.property_class.in_(two_story_classes)

        query_filters.extend(
            [
                # TODO: Neighborhood, but not loaded
                prop_class_query,
                *_min_max_query(
                    model,
                    "building_sq_ft",
                    float,
                    target.building_sq_ft,
                    comparable_params.build_diff,
                ),
                *_min_max_query(
                    model,
                    "land_sq_ft",
                    float,
                    target.land_sq_ft,
                    comparable_params.land_diff,
                ),
            ]
        )
        # If not stucco (4) then include this filter
        exterior_value = target.exterior or 0
        if exterior_value != 4:
            query_filters.append(model.exterior == exterior_value)
    elif region == "milwaukee":
        query_filters.extend(
            [
                model.bedrooms == target.bedrooms or 0,
                model.building_type == target.building_type,
                *_min_max_query(
                    model,
                    "total_sq_ft",
                    float,
                    target.total_sq_ft,
                    comparable_params.sq_ft_diff,
                ),
                ((model.sale_year.is_(None)) | (model.sale_year >= 2021)),
            ]
        )
    else:
        raise Exception("Invalid Region for Comps")

    distance_subquery = (
        db.session.query(
            model,
            ST_DistanceSphere(model.geom, target.geom).label("distance"),
        )
        .filter(*query_filters)
        .subquery()
    )
    model_alias = aliased(model, distance_subquery)

    region_dist_weighting = 2 if region == "cook" else 1
    # TODO: dist_weight 1, valuation weight 3, neighborhood match detroit
    diff_score = (
        (literal_column("distance") / METERS_IN_MILE) * region_dist_weighting
    ) + func.abs(model_alias.age - (target.age or 0)) / 15

    if region == "detroit":
        diff_score = (
            diff_score
            + func.abs(model_alias.total_floor_area - (target.total_floor_area or 0))
            / 100
            - (model_alias.neighborhood == target.neighborhood).cast(Integer)
        )
    elif region == "cook":
        diff_score = (
            diff_score
            + (
                func.abs(model_alias.building_sq_ft - (target.building_sq_ft or 0))
                / ((target.building_sq_ft or 0) * 0.10)
            )
            + (func.abs(model_alias.land_sq_ft - (target.land_sq_ft or 0)))
            / ((target.land_sq_ft or 0) * 0.10)
        )
    elif region == "milwaukee":
        diff_score = (
            diff_score
            + (
                func.abs(model_alias.total_sq_ft - (target.total_sq_ft or 0))
                / ((target.total_sq_ft or 0) * 0.10)
            )
            - ((model_alias.neighborhood == target.neighborhood).cast(Integer) * 5)
        )

    query_limit = 30 if region == "cook" else 10
    query = (
        db.session.query(
            aliased(model, distance_subquery),
            distance_subquery.c.distance,
            diff_score.label("diff_score"),
        )
        .filter(literal_column("distance") < comparable_params.distance)
        .order_by(literal_column("diff_score"))
        .limit(query_limit)
    )

    return [(parcel, distance) for (parcel, distance, _) in query]


def _region_parameters(
    region: str, multiplier: float, target: ParcelType
) -> ComparableParameters:
    if region == "detroit":
        return ComparableParameters(
            age_diff=15 * multiplier,
            distance=METERS_IN_MILE * multiplier,
            floor_diff=100 * multiplier,
            sales=True,
        )
    elif region == "cook":
        return ComparableParameters(
            age_diff=15,
            distance=METERS_IN_MILE * multiplier,
            build_diff=(0.1 * multiplier) * target.building_sq_ft,
            land_diff=(0.1 * multiplier) * target.land_sq_ft,
            sales=False,
        )
    elif region == "milwaukee":
        return ComparableParameters(
            age_diff=15 * multiplier,
            distance=METERS_IN_MILE * multiplier,
            sq_ft_diff=100 * multiplier,
            sales=True,
        )
    else:
        raise ValueError("Invalid region supplied")


# Using this rather than func.abs to make sure compound index is used
def _min_max_query(model, attr, type_, value, diff):
    if value is None:
        return []
    return [
        getattr(model, attr) >= type_(value) - diff,
        getattr(model, attr) <= type_(value) + diff,
    ]
