package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.AddMealItemRequest;
import ai.nutrifit.main_api.dto.CreateMealRequest;
import ai.nutrifit.main_api.dto.MealResponse;
import ai.nutrifit.main_api.dto.UpdateMealItemRequest;
import ai.nutrifit.main_api.dto.UpdateMealRequest;
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

    @PutMapping("/{id}")
    public ResponseEntity<MealResponse> updateMeal(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMealRequest request
    ) {
        MealResponse response = mealService.updateMeal(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long id) {
        mealService.deleteMeal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<MealResponse> addItem(
            @PathVariable Long id,
            @Valid @RequestBody AddMealItemRequest request
    ) {
        MealResponse response = mealService.addItem(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{mealId}/items/{itemId}")
    public ResponseEntity<MealResponse> updateItem(
            @PathVariable Long mealId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateMealItemRequest request
    ) {
        MealResponse response = mealService.updateItem(mealId, itemId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{mealId}/items/{itemId}")
    public ResponseEntity<MealResponse> deleteItem(
            @PathVariable Long mealId,
            @PathVariable Long itemId
    ) {
        MealResponse response = mealService.deleteItem(mealId, itemId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MealResponse>> getMealsByDate(@RequestParam LocalDate date) {
        List<MealResponse> meals = mealService.getMealsByDate(date);
        return ResponseEntity.ok(meals);
    }
}
