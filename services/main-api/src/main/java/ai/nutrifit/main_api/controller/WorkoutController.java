package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.LogWorkoutRequest;
import ai.nutrifit.main_api.dto.WorkoutLogResponse;
import ai.nutrifit.main_api.service.WorkoutService;
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

    @GetMapping
    public ResponseEntity<List<WorkoutLogResponse>> getWorkoutsByDate(@RequestParam LocalDate date) {
        List<WorkoutLogResponse> response = workoutService.getWorkoutsByDate(date);
        return ResponseEntity.ok(response);
    }
}
