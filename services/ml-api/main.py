import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse

from exceptions import EmptyFoodDictionaryError
from recommendation_engine import FoodRecommender
from schemas import (
    ModelRefreshResponse,
    RecommendationRequest,
    RecommendationResponse,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.recommender = FoodRecommender()
    logger.info("FoodRecommender initialized with %s foods", app.state.recommender.food_count)
    yield


app = FastAPI(title="NutriFit ML API", lifespan=lifespan)


def get_recommender(request: Request) -> FoodRecommender:
    return request.app.state.recommender


@app.exception_handler(EmptyFoodDictionaryError)
async def empty_food_dictionary_handler(
    _request: Request,
    exc: EmptyFoodDictionaryError,
) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": exc.message},
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/recommend", response_model=RecommendationResponse)
async def recommend(
    body: RecommendationRequest,
    recommender: FoodRecommender = Depends(get_recommender),
) -> RecommendationResponse:
    food_ids = recommender.get_recommendations(
        target_calories=body.target_calories,
        target_protein=body.target_protein,
        target_carbs=body.target_carbs,
        target_fat=body.target_fat,
        top_k=3,
    )
    return RecommendationResponse(food_ids=food_ids)


@app.post("/api/v1/model/refresh", response_model=ModelRefreshResponse)
async def refresh_model(
    recommender: FoodRecommender = Depends(get_recommender),
) -> ModelRefreshResponse:
    recommender.refresh()
    return ModelRefreshResponse(status="ok", food_count=recommender.food_count)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)
