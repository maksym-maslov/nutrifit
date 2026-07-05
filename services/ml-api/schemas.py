from typing import Literal

from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    target_calories: float = Field(ge=0)
    target_protein: float = Field(ge=0)
    target_carbs: float = Field(ge=0)
    target_fat: float = Field(ge=0)


class RecommendationResponse(BaseModel):
    food_ids: list[int]


class ModelRefreshResponse(BaseModel):
    status: Literal["ok"]
    food_count: int
