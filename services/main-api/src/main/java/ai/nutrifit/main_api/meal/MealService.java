package ai.nutrifit.main_api.meal;

import ai.nutrifit.main_api.catalog.entity.FoodDictionary;
import ai.nutrifit.main_api.catalog.repository.FoodDictionaryRepository;
import ai.nutrifit.main_api.meal.dto.AddMealItemRequest;
import ai.nutrifit.main_api.meal.dto.CreateMealRequest;
import ai.nutrifit.main_api.meal.dto.MealResponse;
import ai.nutrifit.main_api.meal.dto.UpdateMealItemRequest;
import ai.nutrifit.main_api.meal.dto.UpdateMealRequest;
import ai.nutrifit.main_api.meal.entity.Meal;
import ai.nutrifit.main_api.meal.entity.MealItem;
import ai.nutrifit.main_api.meal.repository.MealRepository;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.repository.UserRepository;
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
        Meal meal = findOwnedMeal(mealId);

        FoodDictionary food = foodDictionaryRepository.findById(request.foodId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));

        MealItem item = new MealItem();
        item.setFood(food);
        item.setWeightG(request.weightG());
        meal.addItem(item);

        return MealResponse.from(mealRepository.save(meal));
    }

    @Transactional
    public MealResponse updateMeal(Long mealId, UpdateMealRequest request) {
        Meal meal = findOwnedMeal(mealId);
        meal.setName(request.name());
        return MealResponse.from(mealRepository.save(meal));
    }

    @Transactional
    public void deleteMeal(Long mealId) {
        Meal meal = findOwnedMeal(mealId);
        mealRepository.delete(meal);
    }

    @Transactional
    public MealResponse updateItem(Long mealId, Long itemId, UpdateMealItemRequest request) {
        Meal meal = findOwnedMeal(mealId);
        MealItem item = findItemInMeal(meal, itemId);

        FoodDictionary food = foodDictionaryRepository.findById(request.foodId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));

        item.setFood(food);
        item.setWeightG(request.weightG());

        return MealResponse.from(mealRepository.save(meal));
    }

    @Transactional
    public MealResponse deleteItem(Long mealId, Long itemId) {
        Meal meal = findOwnedMeal(mealId);
        MealItem item = findItemInMeal(meal, itemId);
        meal.getItems().remove(item);

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

    private Meal findOwnedMeal(Long mealId) {
        Long userId = authenticationFacade.getCurrentUserId();
        return mealRepository.findByIdAndUser_Id(mealId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal not found"));
    }

    private MealItem findItemInMeal(Meal meal, Long itemId) {
        return meal.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal item not found"));
    }
}
