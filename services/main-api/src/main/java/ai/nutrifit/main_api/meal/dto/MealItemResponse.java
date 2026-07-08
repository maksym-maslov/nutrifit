package ai.nutrifit.main_api.meal.dto;

import ai.nutrifit.main_api.catalog.dto.FoodDictionaryResponse;
import ai.nutrifit.main_api.meal.entity.MealItem;

public record MealItemResponse(
        Long id,
        FoodDictionaryResponse food,
        Float weightG,
        int itemCalories,
        float itemProtein,
        float itemCarbs,
        float itemFat
) {
    public static MealItemResponse from(MealItem item) {
        FoodDictionaryResponse food = FoodDictionaryResponse.from(item.getFood());
        float weightG = item.getWeightG();

        int itemCalories = Math.round(food.caloriesPer100g() * weightG / 100f);
        float itemProtein = food.proteinPer100g() * weightG / 100f;
        float itemCarbs = food.carbsPer100g() * weightG / 100f;
        float itemFat = food.fatPer100g() * weightG / 100f;

        return new MealItemResponse(
                item.getId(),
                food,
                weightG,
                itemCalories,
                itemProtein,
                itemCarbs,
                itemFat
        );
    }
}
