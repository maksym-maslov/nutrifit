package ai.nutrifit.main_api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateMealItemRequest(
        @NotNull @Positive Long foodId,
        @NotNull @Positive Float weightG
) {
}
