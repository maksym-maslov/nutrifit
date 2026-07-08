package ai.nutrifit.main_api.catalog.repository;

import ai.nutrifit.main_api.catalog.entity.FoodDictionary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodDictionaryRepository extends JpaRepository<FoodDictionary, Long> {
    List<FoodDictionary> findAllByNameContainingIgnoreCase(String name);
}
