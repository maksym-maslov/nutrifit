package ai.nutrifit.main_api.auth.repository;

import ai.nutrifit.main_api.auth.entity.RefreshToken;
import ai.nutrifit.main_api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteByUser(User user);
}
