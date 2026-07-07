package ai.nutrifit.main_api.repository;

import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);

    void deleteByUser(User user);
}
