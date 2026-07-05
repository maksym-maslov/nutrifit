import threading

import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sqlalchemy import Engine

from database import create_db_engine, load_food_dictionary
from exceptions import EmptyFoodDictionaryError

NUTRITION_COLUMNS = [
    "calories_per_100g",
    "protein_per_100g",
    "carbs_per_100g",
    "fat_per_100g",
]


class FoodRecommender:
    def __init__(self, engine: Engine | None = None) -> None:
        self._engine = engine or create_db_engine()
        self._lock = threading.Lock()
        self._scaler = StandardScaler()
        self._model = NearestNeighbors(algorithm="auto")
        self._food_ids: list[int] = []
        self._sample_count = 0
        self._fit()

    @property
    def food_count(self) -> int:
        return self._sample_count

    def _fit(self) -> None:
        food_df = load_food_dictionary(self._engine)
        if food_df.empty:
            raise EmptyFoodDictionaryError()

        scaled_features = self._scaler.fit_transform(food_df[NUTRITION_COLUMNS])
        neighbor_count = min(3, len(food_df))
        self._model = NearestNeighbors(algorithm="auto", n_neighbors=neighbor_count)
        self._model.fit(scaled_features)

        self._food_ids = food_df["id"].astype(int).tolist()
        self._sample_count = len(food_df)

    def refresh(self) -> None:
        with self._lock:
            self._fit()

    def get_recommendations(
        self,
        target_calories: float,
        target_protein: float,
        target_carbs: float,
        target_fat: float,
        top_k: int = 3,
    ) -> list[int]:
        with self._lock:
            target_vector = pd.DataFrame(
                [[target_calories, target_protein, target_carbs, target_fat]],
                columns=NUTRITION_COLUMNS,
            )
            scaled_target = self._scaler.transform(target_vector)
            neighbor_count = min(top_k, self._sample_count)
            _, indices = self._model.kneighbors(scaled_target, n_neighbors=neighbor_count)
            return [self._food_ids[index] for index in indices[0]]
