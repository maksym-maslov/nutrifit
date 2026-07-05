package ai.nutrifit.main_api.repository;

import ai.nutrifit.main_api.entity.MealItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealItemRepository extends JpaRepository<MealItem, Long> {
}
