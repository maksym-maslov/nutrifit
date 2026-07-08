package ai.nutrifit.main_api.auth.repository;

import ai.nutrifit.main_api.auth.entity.VerificationToken;
import ai.nutrifit.main_api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);

    void deleteByUser(User user);
}
