package ai.nutrifit.main_api.catalog.dto;

import ai.nutrifit.main_api.catalog.entity.FoodDictionary;

public record FoodDictionaryResponse(
        Long id,
        String name,
        String brand,
        Integer caloriesPer100g,
        Float proteinPer100g,
        Float carbsPer100g,
        Float fatPer100g
) {
    public static FoodDictionaryResponse from(FoodDictionary food) {
        return new FoodDictionaryResponse(
                food.getId(),
                food.getName(),
                food.getBrand(),
                food.getCaloriesPer100g(),
                food.getProteinPer100g(),
                food.getCarbsPer100g(),
                food.getFatPer100g()
        );
    }
}
