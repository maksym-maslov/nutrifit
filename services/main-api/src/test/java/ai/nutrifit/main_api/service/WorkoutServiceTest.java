package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.LogWorkoutRequest;
import ai.nutrifit.main_api.dto.WorkoutLogResponse;
import ai.nutrifit.main_api.entity.ExerciseDictionary;
import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.entity.WorkoutLog;
import ai.nutrifit.main_api.repository.ExerciseDictionaryRepository;
import ai.nutrifit.main_api.repository.UserRepository;
import ai.nutrifit.main_api.repository.WorkoutLogRepository;
import ai.nutrifit.main_api.security.AuthenticationFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkoutServiceTest {
    @Mock private WorkoutLogRepository workoutLogRepository;
    @Mock private ExerciseDictionaryRepository exerciseDictionaryRepository;
    @Mock private UserRepository userRepository;
    @Mock private AuthenticationFacade authenticationFacade;

    private WorkoutService workoutService;

    @BeforeEach
    void setUp() {
        workoutService = new WorkoutService(
                workoutLogRepository, exerciseDictionaryRepository, userRepository, authenticationFacade);
        when(authenticationFacade.getCurrentUserId()).thenReturn(1L);
        when(workoutLogRepository.save(any(WorkoutLog.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void knownMetFormulaResult() {
        // duration=10, MET=4.0, weight=100kg → 10 × (4.0 × 3.5 × 100 / 200) = 10 × 7.0 = 70
        // All intermediates are exactly representable in float32
        User user = userWithWeight(100.0f);
        ExerciseDictionary exercise = exerciseWithMet(4.0f);
        stubDependencies(user, exercise);

        WorkoutLogResponse result = workoutService.logWorkout(new LogWorkoutRequest(1L, 10, LocalDateTime.now()));

        assertThat(result.caloriesBurned()).isEqualTo(70);
    }

    @Test
    void nullWeightFallsBackTo70kg() {
        // duration=4, MET=10.0, weight=null → uses 70.0f default → 4 × (10.0 × 3.5 × 70 / 200) = 4 × 12.25 = 49
        User user = userWithWeight(null);
        ExerciseDictionary exercise = exerciseWithMet(10.0f);
        stubDependencies(user, exercise);

        WorkoutLogResponse result = workoutService.logWorkout(new LogWorkoutRequest(1L, 4, LocalDateTime.now()));

        // 10.0 × 3.5 × 70 / 200 = 12.25 (exact: 12.25 = 49/4, representable in float32); 4 × 12.25 = 49
        assertThat(result.caloriesBurned()).isEqualTo(49);
    }

    @Test
    void halfCalorieRoundsUp() {
        // duration=1, MET=4.0, weight=50kg → 1 × (4.0 × 3.5 × 50 / 200) = 1 × 3.5 = 3.5
        // 3.5 is exactly representable in float32; Math.round(3.5f) = 4 (rounds half-up)
        User user = userWithWeight(50.0f);
        ExerciseDictionary exercise = exerciseWithMet(4.0f);
        stubDependencies(user, exercise);

        WorkoutLogResponse result = workoutService.logWorkout(new LogWorkoutRequest(1L, 1, LocalDateTime.now()));

        assertThat(result.caloriesBurned()).isEqualTo(4);
    }

    // --- Helpers ---

    private User userWithWeight(Float weightKg) {
        User user = new User();
        user.setWeightKg(weightKg);
        user.setEmail("user@test.com");
        user.setFullName("Test");
        user.setRole("ROLE_USER");
        return user;
    }

    private ExerciseDictionary exerciseWithMet(float met) {
        ExerciseDictionary exercise = new ExerciseDictionary();
        exercise.setName("Test Exercise");
        exercise.setMetValue(met);
        exercise.setCategory("cardio");
        return exercise;
    }

    private void stubDependencies(User user, ExerciseDictionary exercise) {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(exerciseDictionaryRepository.findById(1L)).thenReturn(Optional.of(exercise));
    }
}
