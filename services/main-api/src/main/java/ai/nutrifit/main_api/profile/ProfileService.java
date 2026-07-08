package ai.nutrifit.main_api.profile;

import ai.nutrifit.main_api.auth.EmailService;
import ai.nutrifit.main_api.auth.entity.VerificationToken;
import ai.nutrifit.main_api.auth.repository.RefreshTokenRepository;
import ai.nutrifit.main_api.auth.repository.VerificationTokenRepository;
import ai.nutrifit.main_api.profile.dto.OnboardingRequest;
import ai.nutrifit.main_api.profile.dto.UpdateAccountRequest;
import ai.nutrifit.main_api.profile.dto.UpdateProfileRequest;
import ai.nutrifit.main_api.profile.dto.UserProfileSummaryDTO;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.enums.ActivityLevel;
import ai.nutrifit.main_api.user.enums.FitnessGoal;
import ai.nutrifit.main_api.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.UUID;

@Service
public class ProfileService {
    private static final int MIN_AGE = 1;
    private static final int MAX_AGE = 120;
    private static final int VERIFICATION_TOKEN_VALIDITY_HOURS = 24;

    private final UserRepository userRepository;
    private final AuthenticationFacade authenticationFacade;
    private final VerificationTokenRepository verificationTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailService emailService;

    public ProfileService(
            UserRepository userRepository,
            AuthenticationFacade authenticationFacade,
            VerificationTokenRepository verificationTokenRepository,
            RefreshTokenRepository refreshTokenRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.authenticationFacade = authenticationFacade;
        this.verificationTokenRepository = verificationTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailService = emailService;
    }

    @Transactional
    public UserProfileSummaryDTO completeOnboarding(User user, OnboardingRequest request) {
        applyProfileAndRecalculateGoals(
                user,
                request.birthday(),
                request.gender(),
                request.heightCm(),
                request.weightKg(),
                request.fitnessGoal(),
                request.activityLevel()
        );
        User savedUser = userRepository.save(user);
        return UserProfileSummaryDTO.from(savedUser);
    }

    @Transactional
    public UserProfileSummaryDTO updateProfile(User user, UpdateProfileRequest request) {
        if (!isOnboarded(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Complete onboarding before updating profile");
        }

        applyProfileAndRecalculateGoals(
                user,
                request.birthday(),
                request.gender(),
                request.heightCm(),
                request.weightKg(),
                request.fitnessGoal(),
                request.activityLevel()
        );
        User savedUser = userRepository.save(user);
        return UserProfileSummaryDTO.from(savedUser);
    }

    @Transactional
    public UserProfileSummaryDTO updateAccount(User user, UpdateAccountRequest request) {
        user.setFullName(request.fullName().trim());
        User savedUser = userRepository.save(user);
        return UserProfileSummaryDTO.from(savedUser);
    }

    @Transactional
    public void deleteCurrentUser() {
        Long userId = authenticationFacade.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(user);
    }

    @Transactional
    public void updateEmail(String newEmail) {
        String normalizedEmail = newEmail.trim();

        Long userId = authenticationFacade.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (normalizedEmail.equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New email must be different from current email");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        user.setEmail(normalizedEmail);
        user.setIsEmailVerified(false);
        userRepository.save(user);

        verificationTokenRepository.deleteByUser(user);

        String rawToken = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(rawToken);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(VERIFICATION_TOKEN_VALIDITY_HOURS));
        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(normalizedEmail, rawToken);

        refreshTokenRepository.deleteByUser(user);
    }

    private void applyProfileAndRecalculateGoals(
            User user,
            LocalDate birthday,
            String gender,
            float heightCm,
            float weightKg,
            FitnessGoal fitnessGoal,
            ActivityLevel activityLevel
    ) {
        int age = calculateAge(birthday);
        if (age < MIN_AGE || age > MAX_AGE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Birthday must correspond to an age between " + MIN_AGE + " and " + MAX_AGE
            );
        }

        String normalizedGender = normalizeGender(gender);

        float bmr = calculateBmr(normalizedGender, weightKg, heightCm, age);
        float tdee = bmr * activityLevel.getMultiplier();
        float targetCaloriesFloat = calculateTargetCalories(tdee, fitnessGoal);
        int goalCalories = Math.round(targetCaloriesFloat);

        float proteinG = calculateProteinG(fitnessGoal, weightKg);
        float goalProteinG = (float) Math.round(proteinG);

        float fatG = (goalCalories * 0.25f) / 9.0f;
        float goalFatG = (float) Math.round(fatG);

        float carbsG = (goalCalories - (goalProteinG * 4f) - (goalFatG * 9f)) / 4.0f;
        float goalCarbsG = (float) Math.round(carbsG);

        user.setBirthday(birthday);
        user.setGender(normalizedGender);
        user.setHeightCm(heightCm);
        user.setFitnessGoal(fitnessGoal);
        user.setActivityLevel(activityLevel);
        user.setWeightKg(weightKg);
        user.setGoalCalories(goalCalories);
        user.setGoalProteinG(goalProteinG);
        user.setGoalCarbsG(goalCarbsG);
        user.setGoalFatG(goalFatG);
    }

    private boolean isOnboarded(User user) {
        return user.getBirthday() != null && user.getFitnessGoal() != null;
    }

    private int calculateAge(LocalDate birthday) {
        return Period.between(birthday, LocalDate.now()).getYears();
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
