package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.FoodDictionaryResponse;
import ai.nutrifit.main_api.service.FoodDictionaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/foods")
public class FoodController {
    private final FoodDictionaryService foodDictionaryService;

    public FoodController(FoodDictionaryService foodDictionaryService) {
        this.foodDictionaryService = foodDictionaryService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodDictionaryResponse>> searchFoods(@RequestParam String query) {
        List<FoodDictionaryResponse> foods = foodDictionaryService.searchFoods(query);
        return ResponseEntity.ok(foods);
    }
}
