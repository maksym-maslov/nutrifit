package ai.nutrifit.main_api.recommendation.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record MlRecommendationResponse(
        @JsonProperty("food_ids") List<Long> recommendedFoodIds
) {
}
