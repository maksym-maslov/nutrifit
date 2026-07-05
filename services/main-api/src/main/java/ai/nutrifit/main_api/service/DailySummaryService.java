package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.DailySummaryResponse;
import ai.nutrifit.main_api.dto.MealItemResponse;
import ai.nutrifit.main_api.entity.Meal;
import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.entity.WorkoutLog;
import ai.nutrifit.main_api.repository.MealRepository;
import ai.nutrifit.main_api.repository.UserRepository;
import ai.nutrifit.main_api.repository.WorkoutLogRepository;
import ai.nutrifit.main_api.security.AuthenticationFacade;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DailySummaryService {
    private final UserRepository userRepository;
    private final MealRepository mealRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final AuthenticationFacade authenticationFacade;

    public DailySummaryService(
            UserRepository userRepository,
            MealRepository mealRepository,
            WorkoutLogRepository workoutLogRepository,
            AuthenticationFacade authenticationFacade
    ) {
        this.userRepository = userRepository;
        this.mealRepository = mealRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.authenticationFacade = authenticationFacade;
    }

    @Transactional(readOnly = true)
    public DailySummaryResponse getDailySummary(LocalDate date) {
        Long userId = authenticationFacade.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        int baseCalories  = user.getGoalCalories()  != null ? user.getGoalCalories()  : 2000;
        float baseProtein = user.getGoalProteinG()  != null ? user.getGoalProteinG()  : 150.0f;
        float baseCarbs   = user.getGoalCarbsG()    != null ? user.getGoalCarbsG()    : 250.0f;
        float baseFat     = user.getGoalFatG()      != null ? user.getGoalFatG()      : 65.0f;

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end   = date.plusDays(1).atStartOfDay();

        List<Meal> meals = mealRepository.findByUser_IdAndLoggedAtBetween(userId, start, end);
        int totalCaloriesConsumed   = 0;
        float totalProteinConsumed  = 0f;
        float totalCarbsConsumed    = 0f;
        float totalFatConsumed      = 0f;

        for (Meal meal : meals) {
            for (MealItemResponse item : meal.getItems().stream().map(MealItemResponse::from).toList()) {
                totalCaloriesConsumed += item.itemCalories();
                totalProteinConsumed  += item.itemProtein();
                totalCarbsConsumed    += item.itemCarbs();
                totalFatConsumed      += item.itemFat();
            }
        }

        List<WorkoutLog> workouts = workoutLogRepository.findByUser_IdAndLoggedAtBetween(userId, start, end);
        int totalCaloriesBurned = workouts.stream()
                .mapToInt(WorkoutLog::getCaloriesBurned)
                .sum();

        int adjustedCalories     = baseCalories + totalCaloriesBurned;
        float earnedProtein      = (totalCaloriesBurned * 0.20f) / 4f;
        float earnedCarbs        = (totalCaloriesBurned * 0.80f) / 4f;
        float adjustedProtein    = baseProtein + earnedProtein;
        float adjustedCarbs      = baseCarbs + earnedCarbs;
        float adjustedFat        = baseFat;

        return new DailySummaryResponse(
                date,
                totalCaloriesConsumed,
                totalProteinConsumed,
                totalCarbsConsumed,
                totalFatConsumed,
                totalCaloriesBurned,
                baseCalories,
                baseProtein,
                baseCarbs,
                baseFat,
                adjustedCalories,
                adjustedProtein,
                adjustedCarbs,
                adjustedFat
        );
    }
}
