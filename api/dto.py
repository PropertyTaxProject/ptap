from datetime import date
from typing import Self

from pydantic import BaseModel, Field

from .constants import METERS_IN_MILE
from .models import CookParcel, ParcelType


class ParcelResponseBody(BaseModel):
    pin: str
    address: str
    distance: str | None
    neighborhood: str | None
    assessed_value: str | None
    taxable_value: str | None
    sale_price: str | None
    sale_date: date | None
    property_class: str | None
    year_built: int | None
    total_sq_ft: float | None
    building_sq_ft: float | None
    land_sq_ft: float | None
    stories: str | None
    rooms: int | None
    baths: str | None
    bedrooms: int | None
    exterior: str | None
    basement: str | None
    garage: str | None
    building_type: str | None
    condition: str | None
    sale_validity: str | None
    eligible: bool

    @classmethod
    def from_parcel(
        cls,
        parcel: ParcelType,
        distance: float | None = None,
    ) -> Self:
        building_sq_ft = getattr(parcel, "building_sq_ft", None)
        total_floor_area = getattr(parcel, "total_floor_area", None)
        if total_floor_area:
            building_sq_ft = total_floor_area
        return cls(
            pin=parcel.pin,
            address=f"{parcel.street_number} {parcel.street_name}",
            distance=ParcelResponseBody.clean_distance(distance),
            neighborhood=getattr(parcel, "neighborhood", None),
            assessed_value=ParcelResponseBody.clean_currency(parcel.assessed_value),
            taxable_value=ParcelResponseBody.clean_currency(
                getattr(parcel, "taxable_value", None)
            ),
            sale_price=ParcelResponseBody.clean_currency(parcel.sale_price),
            sale_date=ParcelResponseBody.clean_date(getattr(parcel, "sale_date", None)),  # type: ignore[arg-type]
            property_class=getattr(parcel, "property_class", None),
            year_built=parcel.year_built,
            total_sq_ft=getattr(parcel, "total_sq_ft", None),
            building_sq_ft=building_sq_ft,
            land_sq_ft=getattr(parcel, "land_sq_ft", None),
            stories=ParcelResponseBody.clean_stories(getattr(parcel, "stories", None)),
            rooms=getattr(parcel, "rooms", None),
            baths=ParcelResponseBody.clean_baths(parcel),
            bedrooms=getattr(parcel, "bedrooms", None),
            exterior=ParcelResponseBody.clean_exterior(parcel),
            basement=ParcelResponseBody.clean_basement(parcel),
            garage=ParcelResponseBody.clean_garage(getattr(parcel, "garage", None)),
            building_type=getattr(parcel, "building_type", None),
            condition=getattr(parcel, "condition", None),
            sale_validity=getattr(parcel, "sale_validity", None),
            eligible=ParcelResponseBody.clean_eligible(parcel),
        )

    @classmethod
    def clean_currency(cls, value: float | None) -> str | None:
        if value is None:
            return None
        return f"${value:,.0f}"

    @classmethod
    def clean_date(cls, value: date | None) -> str | None:
        if value is None:
            return None
        return value.strftime("%Y-%m-%d")

    @classmethod
    def clean_distance(cls, value: float | None) -> str | None:
        if value is None:
            return None
        return f"{(value / METERS_IN_MILE):.2f} mi"

    @classmethod
    def clean_stories(cls, value: int | None) -> str | None:
        if value is None:
            return None
        return str(
            {
                1: "1 to 1.5",
                2: "1.5 to 2.5",
                3: "3+",
            }.get(value)
        )

    @classmethod
    def clean_exterior(cls, parcel: ParcelType) -> str | None:
        if not hasattr(parcel, "exterior"):
            return None
        if hasattr(parcel, "building_sq_ft"):
            return {1: "Wood", 2: "Masonry", 3: "Wood/Masonry", 4: "Stucco"}.get(
                parcel.exterior
            )
        return {1: "Siding", 2: "Brick/other", 3: "Brick", 4: "Other"}.get(
            parcel.exterior
        )

    @classmethod
    def clean_baths(cls, parcel: ParcelType) -> str | None:
        if isinstance(parcel, CookParcel):
            return None
        if hasattr(parcel, "half_baths"):
            return f"{parcel.baths}.{parcel.half_baths or 0}"
        return {1: "1", 2: "1.5", 3: "2 to 3", 4: "3+"}.get(parcel.baths)

    @classmethod
    def clean_garage(cls, garage: bool | None) -> str | None:
        if garage is None:
            return None
        return "Yes" if garage else "None"

    @classmethod
    def clean_basement(cls, parcel: ParcelType) -> str | None:
        if not hasattr(parcel, "basement"):
            return None
        if hasattr(parcel, "exterior"):
            return "Full" if parcel.basement else "Partial/None"
        return "Yes" if parcel.basement else "None"

    @classmethod
    def clean_eligible(cls, parcel: ParcelType) -> bool:
        return (parcel.assessed_value is not None) and (
            parcel.assessed_value
            <= {
                "detroit": 200000,
                "cook": 225000,
                "milwaukee": 150000,
            }.get(parcel.__tablename__)
        )


class SearchResponseBody(BaseModel):
    uuid: str
    search_properties: list[ParcelResponseBody] = Field(default_factory=list)


class EligibilityBody(BaseModel):
    hope: bool | None = None
    owner: bool
    residence: bool


class UserFormBody(BaseModel):
    email: str
    first_name: str
    last_name: str
    address: str
    city: str
    state: str
    phone: str
    phonetype: str | None = None
    altcontact: str | None = None
    mailingsame: str | None = None
    heardabout: str | None = None


class UserPropertyBody(BaseModel):
    validcharacteristics: str | None = None
    characteristicsinput: str | None = None
    valueestimate: str | None = None


class FileBody(BaseModel):
    url: str


class RequestBody(BaseModel):
    pin: str
    uuid: str
    region: str
    eligibility: EligibilityBody | None
    eligible: bool | None
    resumed: bool = False
    selected_comparables: list[str] = Field(default_factory=list)
    selected_primary: str | None = None
    agreement: bool | None
    agreement_date: date | None
    agreement_name: str | None
    terms_name: str | None = None
    user: UserFormBody | None
    property: UserPropertyBody | None
    damage: str | None
    damage_level: str | None
    economic_obsolescence: bool | None = None
    files: list[FileBody] = []


class ResponseBody(BaseModel):
    pin: str
    uuid: str
    region: str
    target: ParcelResponseBody | None
    # TODO: search_properties for initial loading?
    eligibility: EligibilityBody | None
    eligible: bool | None
    resumed: bool
    selected_comparables: list[str]
    selected_primary: str | None
    agreement: bool | None
    agreement_date: date | None
    agreement_name: str | None
    comparables: list[ParcelResponseBody]
    user: UserFormBody | None
    property: UserPropertyBody | None
    damage: str | None
    damage_level: str | None
    economic_obsolescence: bool | None
    files: list[FileBody] = Field(default_factory=list)
