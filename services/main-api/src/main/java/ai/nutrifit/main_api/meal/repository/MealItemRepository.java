package ai.nutrifit.main_api.meal.repository;

import ai.nutrifit.main_api.meal.entity.MealItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealItemRepository extends JpaRepository<MealItem, Long> {
}
