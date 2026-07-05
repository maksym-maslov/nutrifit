package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.AddMealItemRequest;
import ai.nutrifit.main_api.dto.CreateMealRequest;
import ai.nutrifit.main_api.dto.MealResponse;
import ai.nutrifit.main_api.service.MealService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/meals")
public class MealController {
    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    @PostMapping
    public ResponseEntity<MealResponse> createMeal(@Valid @RequestBody CreateMealRequest request) {
        MealResponse response = mealService.createMeal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<MealResponse> addItem(
            @PathVariable Long id,
            @Valid @RequestBody AddMealItemRequest request
    ) {
        MealResponse response = mealService.addItem(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MealResponse>> getMealsByDate(@RequestParam LocalDate date) {
        List<MealResponse> meals = mealService.getMealsByDate(date);
        return ResponseEntity.ok(meals);
    }
}
