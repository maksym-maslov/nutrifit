package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.DailySummaryResponse;
import ai.nutrifit.main_api.dto.MlRecommendationRequest;
import ai.nutrifit.main_api.entity.FoodDictionary;
import ai.nutrifit.main_api.repository.FoodDictionaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MealRecommendationService {
    private final FastApiClientService fastApiClientService;
    private final DailySummaryService dailySummaryService;
    private final FoodDictionaryRepository foodDictionaryRepository;

    public MealRecommendationService(
            FastApiClientService fastApiClientService,
            DailySummaryService dailySummaryService,
            FoodDictionaryRepository foodDictionaryRepository
    ) {
        this.fastApiClientService = fastApiClientService;
        this.dailySummaryService = dailySummaryService;
        this.foodDictionaryRepository = foodDictionaryRepository;
    }

    @Transactional(readOnly = true)
    public List<FoodDictionary> suggestMealsForCurrentUser(LocalDate date) {
        DailySummaryResponse summary = dailySummaryService.getDailySummary(date);

        float remainingCalories = Math.max(0f, summary.adjustedCalories() - summary.totalCaloriesConsumed());
        float remainingProtein = Math.max(0f, summary.adjustedProtein() - summary.totalProteinConsumed());
        float remainingCarbs = Math.max(0f, summary.adjustedCarbs() - summary.totalCarbsConsumed());
        float remainingFat = Math.max(0f, summary.adjustedFat() - summary.totalFatConsumed());

        MlRecommendationRequest request = new MlRecommendationRequest(
                remainingCalories,
                remainingProtein,
                remainingCarbs,
                remainingFat
        );

        List<Long> recommendedFoodIds = fastApiClientService.getRecommendations(request);

        Map<Long, FoodDictionary> foodsById = foodDictionaryRepository.findAllById(recommendedFoodIds).stream()
                .collect(Collectors.toMap(FoodDictionary::getId, Function.identity()));

        return recommendedFoodIds.stream()
                .map(foodsById::get)
                .filter(Objects::nonNull)
                .toList();
    }
}
