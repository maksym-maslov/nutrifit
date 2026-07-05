package ai.nutrifit.main_api.dto;

import ai.nutrifit.main_api.entity.User;

public record UserProfileSummaryDTO(
        String fullName,
        String email,
        Float weightKg,
        Integer goalCalories,
        Float goalProteinG,
        Float goalCarbsG,
        Float goalFatG
) {
    public static UserProfileSummaryDTO from(User user) {
        return new UserProfileSummaryDTO(
                user.getFullName(),
                user.getEmail(),
                user.getWeightKg(),
                user.getGoalCalories(),
                user.getGoalProteinG(),
                user.getGoalCarbsG(),
                user.getGoalFatG()
        );
    }
}
