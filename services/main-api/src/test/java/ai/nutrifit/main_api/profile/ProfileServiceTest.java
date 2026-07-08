package ai.nutrifit.main_api.profile;

import ai.nutrifit.main_api.profile.dto.OnboardingRequest;
import ai.nutrifit.main_api.profile.dto.UpdateProfileRequest;
import ai.nutrifit.main_api.profile.dto.UserProfileSummaryDTO;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.enums.ActivityLevel;
import ai.nutrifit.main_api.user.enums.FitnessGoal;
import ai.nutrifit.main_api.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProfileServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationFacade authenticationFacade;

    private ProfileService profileService;

    @BeforeEach
    void setUp() {
        profileService = new ProfileService(userRepository, authenticationFacade);
        // save() returns whatever entity was passed in so we can assert on its fields
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // --- BMR / TDEE ---

    @Test
    void bmrMaleProducesHigherGoalCaloriesThanFemale() {
        // Same inputs; male offset is +5, female is -161 → difference of 166 × activityMultiplier
        LocalDate birthday = LocalDate.now().minusYears(25);

        UserProfileSummaryDTO male = onboard("male", 70f, 170f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.LIGHTLY_ACTIVE);
        UserProfileSummaryDTO female = onboard("female", 70f, 170f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.LIGHTLY_ACTIVE);

        assertThat(male.goalCalories()).isGreaterThan(female.goalCalories());
        // Male BMR - Female BMR = 166; TDEE diff = 166 × 1.375 = 228.25; both round separately
        assertThat(male.goalCalories() - female.goalCalories()).isCloseTo(228, within(2));
    }

    @Test
    void allThreeFitnessGoalCalorieOffsets() {
        // Male, 80 kg, 175 cm, 30 y/o, MODERATELY_ACTIVE (1.55)
        // BMR = 1748.75, TDEE = 2710.56…
        LocalDate birthday = LocalDate.now().minusYears(30);

        UserProfileSummaryDTO lose = onboard("male", 80f, 175f, birthday, FitnessGoal.LOSE_WEIGHT, ActivityLevel.MODERATELY_ACTIVE);
        UserProfileSummaryDTO maintain = onboard("male", 80f, 175f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.MODERATELY_ACTIVE);
        UserProfileSummaryDTO gain = onboard("male", 80f, 175f, birthday, FitnessGoal.GAIN_MUSCLE, ActivityLevel.MODERATELY_ACTIVE);

        assertThat(maintain.goalCalories() - lose.goalCalories()).isEqualTo(500);
        assertThat(gain.goalCalories() - maintain.goalCalories()).isEqualTo(300);
    }

    // --- Macro derivation chain ---

    @Test
    void goalMacrosAreAllWholeNumbers() {
        // Macros are put through Math.round before being stored
        LocalDate birthday = LocalDate.now().minusYears(28);
        UserProfileSummaryDTO result = onboard("female", 65f, 168f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.MODERATELY_ACTIVE);

        assertThat(result.goalProteinG()).isEqualTo(Math.round(result.goalProteinG()));
        assertThat(result.goalFatG()).isEqualTo(Math.round(result.goalFatG()));
        assertThat(result.goalCarbsG()).isEqualTo(Math.round(result.goalCarbsG()));
    }

    @Test
    void carbsAreNeverNegative() {
        // Worst-case low-calorie scenario: small female, sedentary, lose weight
        LocalDate birthday = LocalDate.now().minusYears(30);
        UserProfileSummaryDTO result = onboard("female", 45f, 155f, birthday, FitnessGoal.LOSE_WEIGHT, ActivityLevel.SEDENTARY);

        assertThat(result.goalCarbsG()).isGreaterThanOrEqualTo(0f);
    }

    // --- Age validation ---

    @Test
    void ageExactly120IsAccepted() {
        LocalDate birthday = LocalDate.now().minusYears(120);
        // Must not throw
        UserProfileSummaryDTO result = onboard("male", 70f, 175f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.SEDENTARY);
        assertThat(result).isNotNull();
    }

    @Test
    void age121IsRejected() {
        LocalDate birthday = LocalDate.now().minusYears(121);
        assertThatThrownBy(() -> onboard("male", 70f, 175f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.SEDENTARY))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(BAD_REQUEST));
    }

    // --- Gender normalization ---

    @Test
    void genderIsCaseInsensitiveAndTrimmed() {
        LocalDate birthday = LocalDate.now().minusYears(28);
        UserProfileSummaryDTO result = onboard("  MALE  ", 70f, 175f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.SEDENTARY);

        // gender is stored lowercase; UserProfileSummaryDTO.from() uppercases it for the response
        assertThat(result.gender()).isEqualTo("MALE");
    }

    @Test
    void invalidGenderThrows400() {
        LocalDate birthday = LocalDate.now().minusYears(28);
        assertThatThrownBy(() -> onboard("other", 70f, 175f, birthday, FitnessGoal.MAINTAIN, ActivityLevel.SEDENTARY))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(BAD_REQUEST));
    }

    // --- Account deletion ---

    @Test
    void deleteCurrentUser_deletesUserFromRepository() {
        User user = new User();
        user.setEmail("test@example.com");

        when(authenticationFacade.getCurrentUserId()).thenReturn(42L);
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));

        profileService.deleteCurrentUser();

        verify(userRepository).delete(user);
    }

    @Test
    void deleteCurrentUser_whenUserNotFoundThrows404() {
        when(authenticationFacade.getCurrentUserId()).thenReturn(99L);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.deleteCurrentUser())
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(NOT_FOUND));
    }

    // --- Onboarding guard on updateProfile ---

    @Test
    void updateProfileBeforeOnboardingThrows409() {
        User user = new User();
        user.setBirthday(null); // not onboarded

        UpdateProfileRequest request = new UpdateProfileRequest(
                LocalDate.now().minusYears(28), "male", 175f, 70f,
                FitnessGoal.MAINTAIN, ActivityLevel.SEDENTARY
        );

        assertThatThrownBy(() -> profileService.updateProfile(user, request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(CONFLICT));
    }

    // --- Helpers ---

    private UserProfileSummaryDTO onboard(String gender, float weightKg, float heightCm,
                                          LocalDate birthday, FitnessGoal goal, ActivityLevel activity) {
        User user = new User();
        user.setFullName("Test User");
        user.setEmail("test@example.com");
        OnboardingRequest request = new OnboardingRequest(birthday, gender, heightCm, weightKg, goal, activity);
        return profileService.completeOnboarding(user, request);
    }
}
