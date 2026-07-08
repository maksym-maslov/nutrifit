package ai.nutrifit.main_api.workout;

import ai.nutrifit.main_api.workout.dto.LogWorkoutRequest;
import ai.nutrifit.main_api.workout.dto.UpdateWorkoutRequest;
import ai.nutrifit.main_api.workout.dto.WorkoutLogResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/workouts")
public class WorkoutController {
    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    public ResponseEntity<WorkoutLogResponse> logWorkout(@Valid @RequestBody LogWorkoutRequest request) {
        WorkoutLogResponse response = workoutService.logWorkout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutLogResponse> updateWorkout(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkoutRequest request
    ) {
        WorkoutLogResponse response = workoutService.updateWorkout(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id) {
        workoutService.deleteWorkout(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<WorkoutLogResponse>> getWorkoutsByDate(@RequestParam LocalDate date) {
        List<WorkoutLogResponse> response = workoutService.getWorkoutsByDate(date);
        return ResponseEntity.ok(response);
    }
}
