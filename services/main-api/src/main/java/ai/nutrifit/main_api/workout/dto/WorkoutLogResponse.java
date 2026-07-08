package ai.nutrifit.main_api.workout.dto;

import ai.nutrifit.main_api.catalog.dto.ExerciseDictionaryResponse;
import ai.nutrifit.main_api.workout.entity.WorkoutLog;

import java.time.LocalDateTime;

public record WorkoutLogResponse(
        Long id,
        ExerciseDictionaryResponse exercise,
        Integer durationMinutes,
        Integer caloriesBurned,
        LocalDateTime loggedAt
) {
    public static WorkoutLogResponse from(WorkoutLog log) {
        return new WorkoutLogResponse(
                log.getId(),
                ExerciseDictionaryResponse.from(log.getExercise()),
                log.getDurationMinutes(),
                log.getCaloriesBurned(),
                log.getLoggedAt()
        );
    }
}
