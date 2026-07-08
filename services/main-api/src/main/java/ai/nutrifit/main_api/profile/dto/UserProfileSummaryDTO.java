package ai.nutrifit.main_api.profile.dto;

import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.enums.ActivityLevel;
import ai.nutrifit.main_api.user.enums.FitnessGoal;

import java.time.LocalDate;

public record UserProfileSummaryDTO(
        String fullName,
        String email,
        LocalDate birthday,
        String gender,
        Float heightCm,
        Float weightKg,
        FitnessGoal fitnessGoal,
        ActivityLevel activityLevel,
        Integer goalCalories,
        Float goalProteinG,
        Float goalCarbsG,
        Float goalFatG,
        boolean onboarded
) {
    public static UserProfileSummaryDTO from(User user) {
        boolean onboarded = user.getBirthday() != null && user.getFitnessGoal() != null;
        return new UserProfileSummaryDTO(
                user.getFullName(),
                user.getEmail(),
                user.getBirthday(),
                user.getGender() != null ? user.getGender().toUpperCase() : null,
                user.getHeightCm(),
                user.getWeightKg(),
                user.getFitnessGoal(),
                user.getActivityLevel(),
                user.getGoalCalories(),
                user.getGoalProteinG(),
                user.getGoalCarbsG(),
                user.getGoalFatG(),
                onboarded
        );
    }
}
