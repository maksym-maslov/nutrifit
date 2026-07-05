package ai.nutrifit.main_api.dto;

import ai.nutrifit.main_api.entity.Meal;

import java.time.LocalDateTime;
import java.util.List;

public record MealResponse(
        Long id,
        String name,
        LocalDateTime loggedAt,
        LocalDateTime createdAt,
        List<MealItemResponse> items,
        int totalCalories,
        float totalProtein,
        float totalCarbs,
        float totalFat
) {
    public static MealResponse from(Meal meal) {
        int totalCalories = 0;
        float totalProtein = 0;
        float totalCarbs = 0;
        float totalFat = 0;

        List<MealItemResponse> items = meal.getItems().stream()
                .map(MealItemResponse::from)
                .toList();

        for (MealItemResponse item : items) {
            totalCalories += item.itemCalories();
            totalProtein += item.itemProtein();
            totalCarbs += item.itemCarbs();
            totalFat += item.itemFat();
        }

        return new MealResponse(
                meal.getId(),
                meal.getName(),
                meal.getLoggedAt(),
                meal.getCreatedAt(),
                items,
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFat
        );
    }
}
