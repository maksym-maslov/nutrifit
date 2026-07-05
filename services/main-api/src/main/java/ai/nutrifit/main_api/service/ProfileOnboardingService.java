package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.OnboardingRequest;
import ai.nutrifit.main_api.dto.UserProfileSummaryDTO;
import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.enums.FitnessGoal;
import ai.nutrifit.main_api.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileOnboardingService {
    private final UserRepository userRepository;

    public ProfileOnboardingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserProfileSummaryDTO completeOnboarding(User user, OnboardingRequest request) {
        String gender = normalizeGender(request.gender());

        float bmr = calculateBmr(gender, request.weightKg(), request.heightCm(), request.age());
        float tdee = bmr * request.activityLevel().getMultiplier();
        float targetCaloriesFloat = calculateTargetCalories(tdee, request.fitnessGoal());
        int goalCalories = Math.round(targetCaloriesFloat);

        float proteinG = calculateProteinG(request.fitnessGoal(), request.weightKg());
        float goalProteinG = (float) Math.round(proteinG);

        float fatG = (goalCalories * 0.25f) / 9.0f;
        float goalFatG = (float) Math.round(fatG);

        float carbsG = (goalCalories - (goalProteinG * 4f) - (goalFatG * 9f)) / 4.0f;
        float goalCarbsG = (float) Math.round(carbsG);

        user.setAge(request.age());
        user.setGender(gender);
        user.setHeightCm(request.heightCm());
        user.setFitnessGoal(request.fitnessGoal());
        user.setActivityLevel(request.activityLevel());
        user.setWeightKg(request.weightKg());
        user.setGoalCalories(goalCalories);
        user.setGoalProteinG(goalProteinG);
        user.setGoalCarbsG(goalCarbsG);
        user.setGoalFatG(goalFatG);

        User savedUser = userRepository.save(user);
        return UserProfileSummaryDTO.from(savedUser);
    }

    private String normalizeGender(String gender) {
        if (gender == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gender; expected 'male' or 'female'");
        }

        String normalized = gender.trim().toLowerCase();
        if ("male".equals(normalized) || "female".equals(normalized)) {
            return normalized;
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gender; expected 'male' or 'female'");
    }

    private float calculateBmr(String gender, float weightKg, float heightCm, int age) {
        float base = (10f * weightKg) + (6.25f * heightCm) - (5f * age);
        if ("male".equals(gender)) {
            return base + 5f;
        }
        return base - 161f;
    }

    private float calculateTargetCalories(float tdee, FitnessGoal fitnessGoal) {
        return switch (fitnessGoal) {
            case LOSE_WEIGHT -> tdee - 500f;
            case MAINTAIN -> tdee;
            case GAIN_MUSCLE -> tdee + 300f;
        };
    }

    private float calculateProteinG(FitnessGoal fitnessGoal, float weightKg) {
        return switch (fitnessGoal) {
            case GAIN_MUSCLE, LOSE_WEIGHT -> 2.2f * weightKg;
            case MAINTAIN -> 1.8f * weightKg;
        };
    }
}
