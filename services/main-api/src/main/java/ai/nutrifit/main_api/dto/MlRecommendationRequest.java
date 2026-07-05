package ai.nutrifit.main_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MlRecommendationRequest(
        @JsonProperty("target_calories") float targetCalories,
        @JsonProperty("target_protein") float targetProtein,
        @JsonProperty("target_carbs") float targetCarbs,
        @JsonProperty("target_fat") float targetFat
) {
}
