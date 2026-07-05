package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.ExerciseDictionaryResponse;
import ai.nutrifit.main_api.repository.ExerciseDictionaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class ExerciseDictionaryService {
    private final ExerciseDictionaryRepository exerciseDictionaryRepository;

    public ExerciseDictionaryService(ExerciseDictionaryRepository exerciseDictionaryRepository) {
        this.exerciseDictionaryRepository = exerciseDictionaryRepository;
    }

    @Transactional(readOnly = true)
    public List<ExerciseDictionaryResponse> listExercises() {
        return exerciseDictionaryRepository.findAll().stream()
                .sorted(Comparator.comparing(exercise -> exercise.getName().toLowerCase()))
                .map(ExerciseDictionaryResponse::from)
                .toList();
    }
}
