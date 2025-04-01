from datetime import date
from typing import List, Optional, Self

from pydantic import BaseModel, Field

from .constants import METERS_IN_MILE
from .models import ParcelType


class ParcelResponseBody(BaseModel):
    pin: str
    address: str
    distance: Optional[str]
    neighborhood: Optional[str]
    assessed_value: Optional[str]
    taxable_value: Optional[str]
    sale_price: Optional[str]
    sale_date: Optional[date]
    property_class: Optional[str]
    year_built: Optional[int]
    total_sq_ft: Optional[float]
    building_sq_ft: Optional[float]
    land_sq_ft: Optional[float]
    stories: Optional[str]
    rooms: Optional[int]
    baths: Optional[str]
    bedrooms: Optional[int]
    exterior: Optional[str]
    basement: Optional[str]
    garage: Optional[str]
    building_type: Optional[str]
    condition: Optional[str]
    sale_validity: Optional[str]
    eligible: bool

    @classmethod
    def from_parcel(
        cls,
        parcel: ParcelType,
        distance: Optional[float] = None,
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
            sale_date=ParcelResponseBody.clean_date(getattr(parcel, "sale_date", None)),
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
    def clean_currency(cls, value: Optional[float]) -> Optional[str]:
        if value is None:
            return
        return f"${value:,.0f}"

    @classmethod
    def clean_date(cls, value: Optional[date]) -> Optional[str]:
        if value is None:
            return
        return value.strftime("%Y-%m-%d")

    @classmethod
    def clean_distance(cls, value: Optional[float]) -> Optional[str]:
        if value is None:
            return
        return f"{(value / METERS_IN_MILE):.2f} mi"

    @classmethod
    def clean_stories(cls, value: Optional[int]) -> Optional[str]:
        if value is None:
            return
        return str(
            {
                1: "1 to 1.5",
                2: "1.5 to 2.5",
                3: "3+",
            }.get(value)
        )

    @classmethod
    def clean_exterior(cls, parcel: ParcelType) -> str:
        if not hasattr(parcel, "exterior"):
            return
        if hasattr(parcel, "building_sq_ft"):
            return {1: "Wood", 2: "Masonry", 3: "Wood/Masonry", 4: "Stucco"}.get(
                parcel.exterior
            )
        return {1: "Siding", 2: "Brick/other", 3: "Brick", 4: "Other"}.get(
            parcel.exterior
        )

    @classmethod
    def clean_baths(cls, parcel: ParcelType) -> Optional[str]:
        if getattr(parcel, "baths", None) is None:
            return
        if hasattr(parcel, "half_baths"):
            return f"{parcel.baths}.{parcel.half_baths or 0}"
        return {1: "1", 2: "1.5", 3: "2 to 3", 4: "3+"}.get(parcel.baths)

    @classmethod
    def clean_garage(cls, garage: Optional[bool]) -> Optional[str]:
        if garage is None:
            return
        return "Yes" if garage else "None"

    @classmethod
    def clean_basement(cls, parcel: ParcelType) -> str:
        if not hasattr(parcel, "basement"):
            return
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
    search_properties: List[ParcelResponseBody] = Field(default_factory=list)


class EligibilityBody(BaseModel):
    hope: Optional[bool] = None
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
    phonetype: Optional[str] = None
    altcontact: Optional[str] = None
    mailingsame: Optional[str] = None
    heardabout: Optional[str] = None


class UserPropertyBody(BaseModel):
    validcharacteristics: Optional[str] = None
    characteristicsinput: Optional[str] = None
    valueestimate: Optional[str] = None


class FileBody(BaseModel):
    url: str


class RequestBody(BaseModel):
    pin: str
    uuid: str
    region: str
    eligibility: Optional[EligibilityBody]
    eligible: Optional[bool]
    resumed: bool = False
    selected_comparables: List[str] = Field(default_factory=list)
    selected_primary: Optional[str] = None
    agreement: Optional[bool]
    agreement_date: Optional[date]
    agreement_name: Optional[str]
    terms_name: Optional[str] = None
    user: Optional[UserFormBody]
    property: Optional[UserPropertyBody]
    damage: Optional[str]
    damage_level: Optional[str]
    economic_obsolescence: Optional[bool] = None
    files: List[FileBody] = []


class ResponseBody(BaseModel):
    pin: str
    uuid: str
    region: str
    target: Optional[ParcelResponseBody]
    # TODO: search_properties for initial loading?
    eligibility: Optional[EligibilityBody]
    eligible: Optional[bool]
    resumed: bool
    selected_comparables: List[str]
    selected_primary: Optional[str]
    agreement: Optional[bool]
    agreement_date: Optional[date]
    agreement_name: Optional[str]
    comparables: List[ParcelResponseBody]
    user: Optional[UserFormBody]
    property: Optional[UserPropertyBody]
    damage: Optional[str]
    damage_level: Optional[str]
    economic_obsolescence: Optional[bool]
    files: List[FileBody] = Field(default_factory=list)
