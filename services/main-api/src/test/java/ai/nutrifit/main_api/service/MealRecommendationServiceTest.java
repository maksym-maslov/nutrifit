package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.DailySummaryResponse;
import ai.nutrifit.main_api.dto.MlRecommendationRequest;
import ai.nutrifit.main_api.entity.FoodDictionary;
import ai.nutrifit.main_api.exception.MlApiClientException;
import ai.nutrifit.main_api.repository.FoodDictionaryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MealRecommendationServiceTest {
    @Mock private FastApiClientService fastApiClientService;
    @Mock private DailySummaryService dailySummaryService;
    @Mock private FoodDictionaryRepository foodDictionaryRepository;

    private MealRecommendationService mealRecommendationService;

    private static final LocalDate TODAY = LocalDate.of(2026, 7, 7);

    @BeforeEach
    void setUp() {
        mealRecommendationService = new MealRecommendationService(
                fastApiClientService, dailySummaryService, foodDictionaryRepository);
        when(fastApiClientService.getRecommendations(any())).thenReturn(List.of());
        when(foodDictionaryRepository.findAllById(any())).thenReturn(List.of());
    }

    @Test
    void zeroRemainingCaloriesSendsAllZeroRequestToMlApi() {
        // User has consumed at or above their adjusted target → remaining = 0
        when(dailySummaryService.getDailySummary(TODAY)).thenReturn(
                summary(2000, 150f, 250f, 65f, 2500, 160f, 300f, 80f));

        ArgumentCaptor<MlRecommendationRequest> captor = ArgumentCaptor.forClass(MlRecommendationRequest.class);
        when(fastApiClientService.getRecommendations(captor.capture())).thenReturn(List.of());

        mealRecommendationService.suggestMealsForCurrentUser(TODAY);

        MlRecommendationRequest sent = captor.getValue();
        assertThat(sent.targetCalories()).isEqualTo(0f);
        assertThat(sent.targetProtein()).isEqualTo(0f);
        assertThat(sent.targetCarbs()).isEqualTo(0f);
        assertThat(sent.targetFat()).isEqualTo(0f);
    }

    @Test
    void remainingCaloriesBelowReferenceKeepsPortionUnitsAtOne() {
        // remaining=100 kcal < 200 reference → portionUnits = max(1, 100/200) = 1
        // → each macro target field = remaining macro value directly (no scaling down)
        when(dailySummaryService.getDailySummary(TODAY)).thenReturn(
                summary(2000, 150f, 250f, 65f, 1900, 140f, 240f, 60f));
        // adjusted=2000, consumed=1900 → remaining calories=100; protein=10f, carbs=10f, fat=5f

        ArgumentCaptor<MlRecommendationRequest> captor = ArgumentCaptor.forClass(MlRecommendationRequest.class);
        when(fastApiClientService.getRecommendations(captor.capture())).thenReturn(List.of());

        mealRecommendationService.suggestMealsForCurrentUser(TODAY);

        MlRecommendationRequest sent = captor.getValue();
        // portionUnits=1, so request = remaining values
        assertThat(sent.targetCalories()).isCloseTo(100f, within(0.1f));
        assertThat(sent.targetProtein()).isCloseTo(10f, within(0.1f));
    }

    @Test
    void remainingCaloriesAboveReferenceScalesMacrosDown() {
        // remaining=600 kcal → portionUnits = 600/200 = 3 → targetCalories = 600/3 = 200
        when(dailySummaryService.getDailySummary(TODAY)).thenReturn(
                summary(2600, 200f, 350f, 80f, 2000, 110f, 200f, 50f));
        // adjusted=2600, consumed=2000 → remaining calories=600; protein=90f, carbs=150f, fat=30f

        ArgumentCaptor<MlRecommendationRequest> captor = ArgumentCaptor.forClass(MlRecommendationRequest.class);
        when(fastApiClientService.getRecommendations(captor.capture())).thenReturn(List.of());

        mealRecommendationService.suggestMealsForCurrentUser(TODAY);

        MlRecommendationRequest sent = captor.getValue();
        assertThat(sent.targetCalories()).isCloseTo(200f, within(0.1f)); // 600/3
        assertThat(sent.targetProtein()).isCloseTo(30f, within(0.1f));   // 90/3
    }

    @Test
    void foodIdsNotFoundInDictionaryAreFilteredOutWithoutException() {
        when(dailySummaryService.getDailySummary(TODAY)).thenReturn(
                summary(2000, 150f, 250f, 65f, 0, 0f, 0f, 0f));

        when(fastApiClientService.getRecommendations(any())).thenReturn(List.of(1L, 99L));

        FoodDictionary knownFood = new FoodDictionary();
        knownFood.setName("Known Food");
        // FoodDictionary.id has no public setter — use ReflectionTestUtils so the map key resolves correctly
        ReflectionTestUtils.setField(knownFood, "id", 1L);
        // Only food ID 1 exists in the DB; ID 99 is unknown and must be silently dropped
        when(foodDictionaryRepository.findAllById(List.of(1L, 99L))).thenReturn(List.of(knownFood));

        List<FoodDictionary> result = mealRecommendationService.suggestMealsForCurrentUser(TODAY);

        assertThat(result).hasSize(1);
        assertThat(result).doesNotContainNull();
    }

    @Test
    void mlApiExceptionPropagatesUnmodified() {
        when(dailySummaryService.getDailySummary(TODAY)).thenReturn(
                summary(2000, 150f, 250f, 65f, 0, 0f, 0f, 0f));
        when(fastApiClientService.getRecommendations(any()))
                .thenThrow(new MlApiClientException("ML API down", HttpStatus.BAD_GATEWAY));

        assertThatThrownBy(() -> mealRecommendationService.suggestMealsForCurrentUser(TODAY))
                .isInstanceOf(MlApiClientException.class)
                .hasMessageContaining("ML API down");
    }

    // --- Helpers ---

    /**
     * Builds a DailySummaryResponse where:
     *   adjusted* fields are the goal values
     *   totalCalories/Protein/Carbs/FatConsumed are the consumed values
     */
    private DailySummaryResponse summary(
            int adjustedCalories, float adjustedProtein, float adjustedCarbs, float adjustedFat,
            int totalCaloriesConsumed, float totalProteinConsumed, float totalCarbsConsumed, float totalFatConsumed) {
        return new DailySummaryResponse(
                TODAY,
                totalCaloriesConsumed, totalProteinConsumed, totalCarbsConsumed, totalFatConsumed,
                0,
                adjustedCalories, adjustedProtein, adjustedCarbs, adjustedFat,
                adjustedCalories, adjustedProtein, adjustedCarbs, adjustedFat
        );
    }
}
