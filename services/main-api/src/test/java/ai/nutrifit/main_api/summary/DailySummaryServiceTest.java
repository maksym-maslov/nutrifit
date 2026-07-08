package ai.nutrifit.main_api.summary;

import ai.nutrifit.main_api.meal.repository.MealRepository;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import ai.nutrifit.main_api.summary.dto.DailySummaryResponse;
import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.repository.UserRepository;
import ai.nutrifit.main_api.workout.entity.WorkoutLog;
import ai.nutrifit.main_api.workout.repository.WorkoutLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DailySummaryServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private MealRepository mealRepository;
    @Mock private WorkoutLogRepository workoutLogRepository;
    @Mock private AuthenticationFacade authenticationFacade;

    private DailySummaryService dailySummaryService;

    private static final LocalDate TEST_DATE = LocalDate.of(2026, 7, 7);
    private static final Long USER_ID = 1L;

    @BeforeEach
    void setUp() {
        dailySummaryService = new DailySummaryService(
                userRepository, mealRepository, workoutLogRepository, authenticationFacade);
        when(authenticationFacade.getCurrentUserId()).thenReturn(USER_ID);
        // No meals or workouts by default
        when(mealRepository.findByUser_IdAndLoggedAtBetween(eq(USER_ID), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(workoutLogRepository.findByUser_IdAndLoggedAtBetween(eq(USER_ID), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
    }

    @Test
    void nonOnboardedUserGetsHardcodedDefaultGoals() {
        // User who has never set goals → all goal fields are null
        User user = new User();
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        DailySummaryResponse result = dailySummaryService.getDailySummary(TEST_DATE);

        assertThat(result.baseCalories()).isEqualTo(2000);
        assertThat(result.baseProtein()).isEqualTo(150.0f);
        assertThat(result.baseCarbs()).isEqualTo(250.0f);
        assertThat(result.baseFat()).isEqualTo(65.0f);
    }

    @Test
    void workoutBurnAdjustsCaloriesAndMacrosWithCorrect80_20Split() {
        // 400 kcal burned: protein gets 20% (80 kcal = 20g), carbs get 80% (320 kcal = 80g)
        User user = onboardedUser(2000, 150f, 250f, 65f);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        WorkoutLog workout = new WorkoutLog();
        workout.setCaloriesBurned(400);
        when(workoutLogRepository.findByUser_IdAndLoggedAtBetween(eq(USER_ID), any(), any()))
                .thenReturn(List.of(workout));

        DailySummaryResponse result = dailySummaryService.getDailySummary(TEST_DATE);

        assertThat(result.adjustedCalories()).isEqualTo(2400);
        assertThat(result.adjustedProtein() - result.baseProtein()).isCloseTo(20.0f, within(0.01f));
        assertThat(result.adjustedCarbs() - result.baseCarbs()).isCloseTo(80.0f, within(0.01f));
        // Verify earned macro kcal sum equals total burned (the invariant)
        float earnedProtein = result.adjustedProtein() - result.baseProtein();
        float earnedCarbs = result.adjustedCarbs() - result.baseCarbs();
        assertThat(earnedProtein * 4f + earnedCarbs * 4f).isCloseTo(400.0f, within(1.0f));
    }

    @Test
    void fatIsUnchangedByWorkouts() {
        User user = onboardedUser(2000, 150f, 250f, 65f);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        WorkoutLog workout = new WorkoutLog();
        workout.setCaloriesBurned(500);
        when(workoutLogRepository.findByUser_IdAndLoggedAtBetween(eq(USER_ID), any(), any()))
                .thenReturn(List.of(workout));

        DailySummaryResponse result = dailySummaryService.getDailySummary(TEST_DATE);

        assertThat(result.adjustedFat()).isEqualTo(result.baseFat());
    }

    @Test
    void zeroWorkoutsDayLeavesAdjustedTargetsEqualToBase() {
        User user = onboardedUser(2200, 160f, 270f, 70f);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        // workoutLogRepository already returns empty list from setUp()

        DailySummaryResponse result = dailySummaryService.getDailySummary(TEST_DATE);

        assertThat(result.adjustedCalories()).isEqualTo(result.baseCalories());
        assertThat(result.adjustedProtein()).isEqualTo(result.baseProtein());
        assertThat(result.adjustedCarbs()).isEqualTo(result.baseCarbs());
        assertThat(result.adjustedFat()).isEqualTo(result.baseFat());
    }

    // --- Helpers ---

    private User onboardedUser(int goalCalories, float goalProtein, float goalCarbs, float goalFat) {
        User user = new User();
        user.setGoalCalories(goalCalories);
        user.setGoalProteinG(goalProtein);
        user.setGoalCarbsG(goalCarbs);
        user.setGoalFatG(goalFat);
        return user;
    }
}
