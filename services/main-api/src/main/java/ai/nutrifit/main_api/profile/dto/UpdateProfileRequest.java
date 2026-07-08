package ai.nutrifit.main_api.profile.dto;

import ai.nutrifit.main_api.user.enums.ActivityLevel;
import ai.nutrifit.main_api.user.enums.FitnessGoal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record UpdateProfileRequest(
        @NotNull @Past LocalDate birthday,
        @NotBlank String gender,
        @NotNull @Positive Float heightCm,
        @NotNull @Positive Float weightKg,
        @NotNull FitnessGoal fitnessGoal,
        @NotNull ActivityLevel activityLevel
) {
}
