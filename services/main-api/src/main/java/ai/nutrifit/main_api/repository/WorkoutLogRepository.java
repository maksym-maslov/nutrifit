package ai.nutrifit.main_api.repository;

import ai.nutrifit.main_api.entity.WorkoutLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    @EntityGraph(attributePaths = {"exercise"})
    List<WorkoutLog> findByUser_IdAndLoggedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
