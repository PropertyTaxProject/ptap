from enum import StrEnum


class Region(StrEnum):
    COOK = "cook"
    DETROIT = "detroit"
    MILWAUKEE = "milwaukee"


METERS_IN_MILE = 1609.344
WORD_MIMETYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)

DAMAGE_TO_CONDITION = {
    "excellent": [95, 98, 100],
    "very_good": [85, 90, 94],
    "good": [75, 80, 84],
    "average": [60, 67, 74],
    "fair": [45, 52, 59],
    "poor": [30, 37, 44],
    "very_poor": [20, 25, 29],
    "unsound": [0, 10, 19],
}

DETROIT_EXTERIOR_MAP = {1: "Siding", 2: "Brick/other", 3: "Brick", 4: "Other"}
