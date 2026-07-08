package ai.nutrifit.main_api.catalog;

import ai.nutrifit.main_api.catalog.dto.FoodDictionaryResponse;
import ai.nutrifit.main_api.catalog.repository.FoodDictionaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodDictionaryService {
    private final FoodDictionaryRepository foodDictionaryRepository;

    public FoodDictionaryService(FoodDictionaryRepository foodDictionaryRepository) {
        this.foodDictionaryRepository = foodDictionaryRepository;
    }

    @Transactional(readOnly = true)
    public List<FoodDictionaryResponse> searchFoods(String query) {
        return foodDictionaryRepository.findAllByNameContainingIgnoreCase(query).stream()
                .map(FoodDictionaryResponse::from)
                .toList();
    }
}
