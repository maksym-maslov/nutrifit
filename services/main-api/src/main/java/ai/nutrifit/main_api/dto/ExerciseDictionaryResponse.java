package ai.nutrifit.main_api.dto;

import ai.nutrifit.main_api.entity.ExerciseDictionary;

public record ExerciseDictionaryResponse(
        Long id,
        String name,
        Float metValue,
        String category
) {
    public static ExerciseDictionaryResponse from(ExerciseDictionary exercise) {
        return new ExerciseDictionaryResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getMetValue(),
                exercise.getCategory()
        );
    }
}
