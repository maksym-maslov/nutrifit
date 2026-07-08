package ai.nutrifit.main_api.auth;

import ai.nutrifit.main_api.auth.dto.ChangePasswordRequest;
import ai.nutrifit.main_api.auth.dto.LoginRequest;
import ai.nutrifit.main_api.auth.dto.RegisterRequest;
import ai.nutrifit.main_api.auth.entity.PasswordResetToken;
import ai.nutrifit.main_api.auth.entity.RefreshToken;
import ai.nutrifit.main_api.auth.repository.PasswordResetTokenRepository;
import ai.nutrifit.main_api.auth.repository.RefreshTokenRepository;
import ai.nutrifit.main_api.auth.repository.VerificationTokenRepository;
import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.GONE;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private VerificationTokenRepository verificationTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private TokenService tokenService;
    @Mock private EmailService emailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                verificationTokenRepository,
                passwordResetTokenRepository,
                passwordEncoder,
                authenticationManager,
                tokenService,
                emailService,
                false);
    }

    @Test
    void expiredRefreshTokenIsDeletedBeforeThrowing401() {
        RefreshToken expiredToken = expiredToken();
        when(refreshTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.refresh("expired-token"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(UNAUTHORIZED));

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
        user.setIsEmailVerified(true);

        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        when(tokenService.generateRefreshToken()).thenReturn("new-refresh-token");
        when(tokenService.generateAccessToken(user)).thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        InOrder order = inOrder(refreshTokenRepository);

        authService.login(new LoginRequest("user@test.com", "password"));

        order.verify(refreshTokenRepository).deleteByUser(user);
        order.verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void logoutWithTokenCallsDeleteByToken() {
        authService.logout("abc");

        verify(refreshTokenRepository).deleteByToken("abc");
    }

    @Test
    void logoutWithNullTokenSkipsDeletion() {
        authService.logout(null);

        verify(refreshTokenRepository, never()).deleteByToken(any());
    }

    @Test
    void duplicateEmailRegistrationThrows409() {
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("taken@example.com", "password123", "Test User")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(CONFLICT));
    }

    @Test
    void processForgotPasswordWithExistingUserCreatesTokenAndSendsEmail() {
        User user = new User();
        user.setEmail("user@test.com");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        authService.processForgotPassword("user@test.com");

        verify(passwordResetTokenRepository).deleteByUser(user);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertThat(savedToken.getToken()).isNotBlank();
        assertThat(savedToken.getUser()).isEqualTo(user);
        assertThat(savedToken.getExpiryDate()).isAfter(LocalDateTime.now());

        verify(emailService).sendPasswordResetEmail("user@test.com", savedToken.getToken());
    }

    @Test
    void processForgotPasswordWithUnknownEmailDoesNothing() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        authService.processForgotPassword("unknown@test.com");

        verify(passwordResetTokenRepository, never()).deleteByUser(any());
        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(any(), any());
    }

    @Test
    void resetPasswordWithValidTokenUpdatesPasswordAndRevokesSessions() {
        User user = new User();
        user.setPassword("old-hash");

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken("valid-token");
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(10));

        when(passwordResetTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");
        when(userRepository.save(user)).thenReturn(user);

        authService.resetPassword("valid-token", "new-password");

        assertThat(user.getPassword()).isEqualTo("new-hash");
        verify(passwordResetTokenRepository).delete(resetToken);
        verify(refreshTokenRepository).deleteByUser(user);
    }

    @Test
    void resetPasswordWithInvalidTokenThrows404() {
        when(passwordResetTokenRepository.findByToken("bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword("bad-token", "new-password"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(NOT_FOUND));
    }

    @Test
    void resetPasswordWithExpiredTokenDeletesTokenAndThrows410() {
        PasswordResetToken expiredToken = new PasswordResetToken();
        expiredToken.setToken("expired-token");
        expiredToken.setExpiryDate(LocalDateTime.now().minusMinutes(1));
        expiredToken.setUser(new User());

        when(passwordResetTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.resetPassword("expired-token", "new-password"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(GONE));

        verify(passwordResetTokenRepository).delete(expiredToken);
    }

    private RefreshToken expiredToken() {
        RefreshToken token = new RefreshToken();
        token.setToken("expired-token");
        token.setExpiryDate(LocalDateTime.now().minusDays(1));
        token.setUser(new User());
        return token;
    }
}
