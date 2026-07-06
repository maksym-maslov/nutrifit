package ai.nutrifit.main_api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateWorkoutRequest(
        @NotNull Long exerciseId,
        @NotNull @Positive Integer durationMinutes
) {
}
