import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import ProgrammingError

from exceptions import EmptyFoodDictionaryError
from recommendation_engine import FoodRecommender
from schemas import (
    ModelRefreshResponse,
    RecommendationRequest,
    RecommendationResponse,
)

logger = logging.getLogger(__name__)

FOOD_DICTIONARY_RETRY_ATTEMPTS = 15
FOOD_DICTIONARY_RETRY_DELAY_SECONDS = 2


def _is_missing_food_dictionary_table(exc: ProgrammingError) -> bool:
    message = str(exc).lower()
    return "food_dictionary" in message and "does not exist" in message


async def _create_recommender() -> FoodRecommender:
    for attempt in range(1, FOOD_DICTIONARY_RETRY_ATTEMPTS + 1):
        try:
            return FoodRecommender()
        except ProgrammingError as exc:
            if not _is_missing_food_dictionary_table(exc):
                raise
            if attempt == FOOD_DICTIONARY_RETRY_ATTEMPTS:
                raise
            logger.warning(
                "food_dictionary table not ready (attempt %s/%s), retrying in %ss",
                attempt,
                FOOD_DICTIONARY_RETRY_ATTEMPTS,
                FOOD_DICTIONARY_RETRY_DELAY_SECONDS,
            )
            await asyncio.sleep(FOOD_DICTIONARY_RETRY_DELAY_SECONDS)

    raise RuntimeError("Failed to initialize FoodRecommender")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.recommender = await _create_recommender()
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
