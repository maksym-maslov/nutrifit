import os

import pandas as pd
from sqlalchemy import Engine, create_engine, text

FOOD_DICTIONARY_QUERY = text(
    """
    SELECT id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
    FROM food_dictionary
    ORDER BY id
    """
)


def get_database_url() -> str:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return database_url


def create_db_engine() -> Engine:
    return create_engine(get_database_url(), pool_pre_ping=True)


def load_food_dictionary(engine: Engine) -> pd.DataFrame:
    with engine.connect() as connection:
        return pd.read_sql(FOOD_DICTIONARY_QUERY, connection)
