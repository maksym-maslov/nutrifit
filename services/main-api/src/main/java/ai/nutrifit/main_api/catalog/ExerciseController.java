package ai.nutrifit.main_api.catalog;

import ai.nutrifit.main_api.catalog.dto.ExerciseDictionaryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exercises")
public class ExerciseController {
    private final ExerciseDictionaryService exerciseDictionaryService;

    public ExerciseController(ExerciseDictionaryService exerciseDictionaryService) {
        this.exerciseDictionaryService = exerciseDictionaryService;
    }

    @GetMapping
    public ResponseEntity<List<ExerciseDictionaryResponse>> listExercises() {
        List<ExerciseDictionaryResponse> exercises = exerciseDictionaryService.listExercises();
        return ResponseEntity.ok(exercises);
    }
}
