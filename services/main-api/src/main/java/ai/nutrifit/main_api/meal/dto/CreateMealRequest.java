package ai.nutrifit.main_api.meal.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMealRequest(
        @NotBlank String name
) {
}
