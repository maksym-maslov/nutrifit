package ai.nutrifit.main_api.workout;

import ai.nutrifit.main_api.catalog.entity.ExerciseDictionary;
import ai.nutrifit.main_api.catalog.repository.ExerciseDictionaryRepository;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import ai.nutrifit.main_api.shared.time.UserTimezone;
import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.repository.UserRepository;
import ai.nutrifit.main_api.workout.dto.LogWorkoutRequest;
import ai.nutrifit.main_api.workout.dto.UpdateWorkoutRequest;
import ai.nutrifit.main_api.workout.dto.WorkoutLogResponse;
import ai.nutrifit.main_api.workout.entity.WorkoutLog;
import ai.nutrifit.main_api.workout.repository.WorkoutLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkoutService {
    private final WorkoutLogRepository workoutLogRepository;
    private final ExerciseDictionaryRepository exerciseDictionaryRepository;
    private final UserRepository userRepository;
    private final AuthenticationFacade authenticationFacade;

    public WorkoutService(
            WorkoutLogRepository workoutLogRepository,
            ExerciseDictionaryRepository exerciseDictionaryRepository,
            UserRepository userRepository,
            AuthenticationFacade authenticationFacade
    ) {
        this.workoutLogRepository = workoutLogRepository;
        this.exerciseDictionaryRepository = exerciseDictionaryRepository;
        this.userRepository = userRepository;
        this.authenticationFacade = authenticationFacade;
    }

    @Transactional
    public WorkoutLogResponse logWorkout(LogWorkoutRequest request) {
        Long userId = authenticationFacade.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ExerciseDictionary exercise = exerciseDictionaryRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        WorkoutLog log = new WorkoutLog();
        log.setUser(user);
        log.setExercise(exercise);
        log.setDurationMinutes(request.durationMinutes());
        log.setCaloriesBurned(computeCaloriesBurned(user, exercise, request.durationMinutes()));
        log.setLoggedAt(UserTimezone.localWallTimeToUtc(request.loggedAt(), user));

        return WorkoutLogResponse.from(workoutLogRepository.save(log));
    }

    @Transactional
    public WorkoutLogResponse updateWorkout(Long id, UpdateWorkoutRequest request) {
        WorkoutLog log = findOwnedWorkout(id);

        ExerciseDictionary exercise = exerciseDictionaryRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        log.setExercise(exercise);
        log.setDurationMinutes(request.durationMinutes());
        log.setCaloriesBurned(computeCaloriesBurned(log.getUser(), exercise, request.durationMinutes()));

        return WorkoutLogResponse.from(workoutLogRepository.save(log));
    }

    @Transactional
    public void deleteWorkout(Long id) {
        WorkoutLog log = findOwnedWorkout(id);
        workoutLogRepository.delete(log);
    }

    @Transactional(readOnly = true)
    public List<WorkoutLogResponse> getWorkoutsByDate(LocalDate date) {
        Long userId = authenticationFacade.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        UserTimezone.UtcDayWindow window = UserTimezone.dayWindowUtc(user, date);

        return workoutLogRepository.findByUser_IdAndLoggedAtBetween(userId, window.startUtc(), window.endUtc()).stream()
                .map(WorkoutLogResponse::from)
                .toList();
    }

    private WorkoutLog findOwnedWorkout(Long id) {
        Long userId = authenticationFacade.getCurrentUserId();
        return workoutLogRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));
    }

    private int computeCaloriesBurned(User user, ExerciseDictionary exercise, int durationMinutes) {
        float weightKg = user.getWeightKg() != null ? user.getWeightKg() : 70.0f;
        return Math.round(durationMinutes * (exercise.getMetValue() * 3.5f * weightKg / 200f));
    }
}
