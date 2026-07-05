package ai.nutrifit.main_api.dto;

import ai.nutrifit.main_api.entity.WorkoutLog;

import java.time.LocalDateTime;

public record WorkoutLogResponse(
        Long id,
        Long exerciseId,
        String exerciseName,
        String category,
        Integer durationMinutes,
        Integer caloriesBurned,
        LocalDateTime loggedAt
) {
    public static WorkoutLogResponse from(WorkoutLog log) {
        return new WorkoutLogResponse(
                log.getId(),
                log.getExercise().getId(),
                log.getExercise().getName(),
                log.getExercise().getCategory(),
                log.getDurationMinutes(),
                log.getCaloriesBurned(),
                log.getLoggedAt()
        );
    }
}
