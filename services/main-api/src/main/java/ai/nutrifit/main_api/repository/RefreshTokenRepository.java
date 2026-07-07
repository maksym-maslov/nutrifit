package ai.nutrifit.main_api.repository;

import ai.nutrifit.main_api.entity.RefreshToken;
import ai.nutrifit.main_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteByUser(User user);
}
