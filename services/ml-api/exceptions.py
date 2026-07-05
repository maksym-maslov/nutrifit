class EmptyFoodDictionaryError(Exception):
    """Raised when the food_dictionary table contains no rows."""

    def __init__(self, message: str = "food_dictionary table is empty") -> None:
        super().__init__(message)
        self.message = message
