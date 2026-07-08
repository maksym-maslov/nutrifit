package ai.nutrifit.main_api.catalog.repository;

import ai.nutrifit.main_api.catalog.entity.ExerciseDictionary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseDictionaryRepository extends JpaRepository<ExerciseDictionary, Long> {
}
