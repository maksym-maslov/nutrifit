package ai.nutrifit.main_api.dto;

import ai.nutrifit.main_api.enums.ActivityLevel;
import ai.nutrifit.main_api.enums.FitnessGoal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OnboardingRequest(
        @NotNull @Min(1) @Max(120) Integer age,
        @NotBlank String gender,
        @NotNull @Positive Float heightCm,
        @NotNull @Positive Float weightKg,
        @NotNull FitnessGoal fitnessGoal,
        @NotNull ActivityLevel activityLevel
) {
}
