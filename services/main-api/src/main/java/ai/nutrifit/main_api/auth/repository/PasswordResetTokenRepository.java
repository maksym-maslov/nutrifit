package ai.nutrifit.main_api.auth.repository;

import ai.nutrifit.main_api.auth.entity.PasswordResetToken;
import ai.nutrifit.main_api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser(User user);
}
