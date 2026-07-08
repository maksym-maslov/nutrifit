package ai.nutrifit.main_api.meal.repository;

import ai.nutrifit.main_api.meal.entity.Meal;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {
    @EntityGraph(attributePaths = {"items", "items.food"})
    List<Meal> findByUser_IdAndLoggedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    @EntityGraph(attributePaths = {"items", "items.food", "user"})
    Optional<Meal> findByIdAndUser_Id(Long id, Long userId);
}
