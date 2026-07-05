package ai.nutrifit.main_api.dto;

import ai.nutrifit.main_api.entity.User;

public record UserProfileSummaryDTO(
        String fullName,
        String email,
        Float weightKg,
        Integer goalCalories,
        Float goalProteinG,
        Float goalCarbsG,
        Float goalFatG,
        boolean onboarded
) {
    public static UserProfileSummaryDTO from(User user) {
        boolean onboarded = user.getAge() != null && user.getFitnessGoal() != null;
        return new UserProfileSummaryDTO(
                user.getFullName(),
                user.getEmail(),
                user.getWeightKg(),
                user.getGoalCalories(),
                user.getGoalProteinG(),
                user.getGoalCarbsG(),
                user.getGoalFatG(),
                onboarded
        );
    }
}
