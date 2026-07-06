package ai.nutrifit.main_api.dto;

import ai.nutrifit.main_api.entity.WorkoutLog;

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
