import pytest  # noqa

from ..submitappeal import detroit_depreciation


def test_detroit_depreciation_schedule():
    assert detroit_depreciation(70, 45, "", "good")["schedule_incorrect"]
    assert not detroit_depreciation(100, 56, "", "good")["schedule_incorrect"]


def test_detroit_depreciation_damage():
    assert detroit_depreciation(50, 45, "", "poor")["damage_incorrect"]
    assert not detroit_depreciation(50, 80, "", "good")["damage_incorrect"]
