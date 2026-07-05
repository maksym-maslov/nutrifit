package ai.nutrifit.main_api.repository;

import ai.nutrifit.main_api.entity.ExerciseDictionary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseDictionaryRepository extends JpaRepository<ExerciseDictionary, Long> {
}
