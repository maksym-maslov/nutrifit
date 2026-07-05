package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.FoodDictionaryResponse;
import ai.nutrifit.main_api.entity.FoodDictionary;
import ai.nutrifit.main_api.service.MealRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {
    private final MealRecommendationService mealRecommendationService;

    public RecommendationController(MealRecommendationService mealRecommendationService) {
        this.mealRecommendationService = mealRecommendationService;
    }

    @GetMapping
    public ResponseEntity<List<FoodDictionaryResponse>> getRecommendations(
            @RequestParam(required = false) LocalDate date
    ) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<FoodDictionary> foods = mealRecommendationService.suggestMealsForCurrentUser(targetDate);
        List<FoodDictionaryResponse> response = foods.stream()
                .map(FoodDictionaryResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }
}
