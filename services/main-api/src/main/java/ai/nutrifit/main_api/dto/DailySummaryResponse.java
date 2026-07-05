package ai.nutrifit.main_api.dto;

import java.time.LocalDate;

public record DailySummaryResponse(
        LocalDate date,

        int totalCaloriesConsumed,
        float totalProteinConsumed,
        float totalCarbsConsumed,
        float totalFatConsumed,

        int totalCaloriesBurned,

        int baseCalories,
        float baseProtein,
        float baseCarbs,
        float baseFat,

        int adjustedCalories,
        float adjustedProtein,
        float adjustedCarbs,
        float adjustedFat
) {
}
