package ai.nutrifit.main_api.repository;

import ai.nutrifit.main_api.entity.Meal;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MealRepository extends JpaRepository<Meal, Long> {
    @EntityGraph(attributePaths = {"items", "items.food"})
    List<Meal> findByUser_IdAndLoggedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
