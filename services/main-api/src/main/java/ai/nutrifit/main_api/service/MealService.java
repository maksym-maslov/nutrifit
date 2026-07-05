package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.AddMealItemRequest;
import ai.nutrifit.main_api.dto.CreateMealRequest;
import ai.nutrifit.main_api.dto.MealResponse;
import ai.nutrifit.main_api.entity.FoodDictionary;
import ai.nutrifit.main_api.entity.Meal;
import ai.nutrifit.main_api.entity.MealItem;
import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.repository.FoodDictionaryRepository;
import ai.nutrifit.main_api.repository.MealRepository;
import ai.nutrifit.main_api.repository.UserRepository;
import ai.nutrifit.main_api.security.AuthenticationFacade;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MealService {
    private final MealRepository mealRepository;
    private final FoodDictionaryRepository foodDictionaryRepository;
    private final UserRepository userRepository;
    private final AuthenticationFacade authenticationFacade;

    public MealService(
            MealRepository mealRepository,
            FoodDictionaryRepository foodDictionaryRepository,
            UserRepository userRepository,
            AuthenticationFacade authenticationFacade
    ) {
        this.mealRepository = mealRepository;
        this.foodDictionaryRepository = foodDictionaryRepository;
        this.userRepository = userRepository;
        this.authenticationFacade = authenticationFacade;
    }

    @Transactional
    public MealResponse createMeal(CreateMealRequest request) {
        Long userId = authenticationFacade.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Meal meal = new Meal();
        meal.setUser(user);
        meal.setName(request.name());
        meal.setLoggedAt(LocalDateTime.now());

        return MealResponse.from(mealRepository.save(meal));
    }

    @Transactional
    public MealResponse addItem(Long mealId, AddMealItemRequest request) {
        Long userId = authenticationFacade.getCurrentUserId();

        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal not found"));

        if (!meal.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal not found");
        }

        FoodDictionary food = foodDictionaryRepository.findById(request.foodId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));

        MealItem item = new MealItem();
        item.setFood(food);
        item.setWeightG(request.weightG());
        meal.addItem(item);

        return MealResponse.from(mealRepository.save(meal));
    }

    @Transactional(readOnly = true)
    public List<MealResponse> getMealsByDate(LocalDate date) {
        Long userId = authenticationFacade.getCurrentUserId();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        return mealRepository.findByUser_IdAndLoggedAtBetween(userId, start, end).stream()
                .map(MealResponse::from)
                .toList();
    }
}
