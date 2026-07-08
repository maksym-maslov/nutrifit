package ai.nutrifit.main_api.meal.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateMealRequest(
        @NotBlank String name
) {
}
