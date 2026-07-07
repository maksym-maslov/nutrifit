package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.ChangePasswordRequest;
import ai.nutrifit.main_api.dto.LoginRequest;
import ai.nutrifit.main_api.dto.RegisterRequest;
import ai.nutrifit.main_api.entity.RefreshToken;
import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.repository.RefreshTokenRepository;
import ai.nutrifit.main_api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private TokenService tokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        // cookieSecure=false avoids needing HTTPS in tests
        authService = new AuthService(
                userRepository, refreshTokenRepository, passwordEncoder,
                authenticationManager, tokenService, false);
    }

    @Test
    void expiredRefreshTokenIsDeletedBeforeThrowing401() {
        RefreshToken expiredToken = expiredToken();
        when(refreshTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.refresh("expired-token"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(UNAUTHORIZED));

        // The delete MUST happen even though an exception is thrown
        verify(refreshTokenRepository).delete(expiredToken);
    }

    @Test
    void changePasswordRevokesAllRefreshTokensForUser() {
        User user = new User();
        user.setPassword("hashed-current");
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-pass", "hashed-current")).thenReturn(true);
        when(passwordEncoder.encode("new-pass")).thenReturn("hashed-new");
        when(userRepository.save(any())).thenReturn(user);

        authService.changePassword(42L, new ChangePasswordRequest("current-pass", "new-pass"));

        verify(refreshTokenRepository).deleteByUser(user);
    }

    @Test
    void loginDeletesPreviousSessionBeforeIssuingNewRefreshToken() {
        User user = new User();
        user.setRole("ROLE_USER");
        user.setEmail("user@test.com");

        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        when(tokenService.generateRefreshToken()).thenReturn("new-refresh-token");
        when(tokenService.generateAccessToken(user)).thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        InOrder order = inOrder(refreshTokenRepository);

        authService.login(new LoginRequest("user@test.com", "password"));

        // delete-old MUST come before save-new so there is never a window with two active sessions
        order.verify(refreshTokenRepository).deleteByUser(user);
        order.verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void duplicateEmailRegistrationThrows409() {
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("taken@example.com", "password123", "Test User")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(CONFLICT));
    }

    // --- Helpers ---

    private RefreshToken expiredToken() {
        RefreshToken token = new RefreshToken();
        token.setToken("expired-token");
        token.setExpiryDate(LocalDateTime.now().minusDays(1)); // already in the past
        token.setUser(new User());
        return token;
    }
}
