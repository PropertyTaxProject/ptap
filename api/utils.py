from typing import Literal, assert_never, overload

from .models import CookParcel, DetroitParcel, MilwaukeeParcel, ParcelType, Region


@overload
def model_from_region(region: Literal["cook"]) -> type[CookParcel]: ...


@overload
def model_from_region(region: Literal["detroit"]) -> type[DetroitParcel]: ...


@overload
def model_from_region(region: Literal["milwaukee"]) -> type[MilwaukeeParcel]: ...


def model_from_region(region: Region) -> type[ParcelType]:
    match region:
        case "cook":
            return CookParcel
        case "detroit":
            return DetroitParcel
        case "milwaukee":
            return MilwaukeeParcel
        case _:
            assert_never(region)


def yes_no(value: bool | None) -> str:
    if value is None:
        return ""
    return "Yes" if value else "No"
