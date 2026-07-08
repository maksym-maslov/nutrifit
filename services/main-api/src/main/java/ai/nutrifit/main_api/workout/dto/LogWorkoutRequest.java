package ai.nutrifit.main_api.workout.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record LogWorkoutRequest(
        @NotNull Long exerciseId,
        @NotNull @Positive Integer durationMinutes,
        @NotNull LocalDateTime loggedAt
) {
}
