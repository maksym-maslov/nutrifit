package ai.nutrifit.main_api.auth;

import ai.nutrifit.main_api.auth.dto.ChangePasswordRequest;
import ai.nutrifit.main_api.auth.dto.ForgotPasswordRequest;
import ai.nutrifit.main_api.auth.dto.LoginRequest;
import ai.nutrifit.main_api.auth.dto.RegisterRequest;
import ai.nutrifit.main_api.auth.dto.ResetPasswordRequest;
import ai.nutrifit.main_api.auth.dto.TokenResponse;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationFacade authenticationFacade;

    public AuthController(AuthService authService, AuthenticationFacade authenticationFacade) {
        this.authService = authService;
        this.authenticationFacade = authenticationFacade;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @CookieValue(name = "refreshToken") String refreshToken) {
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authService.buildLogoutCookie().toString())
                .build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = authenticationFacade.getCurrentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.processForgotPassword(request.email());
        return ResponseEntity.ok(Map.of("message", "If that email exists, a reset link was sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }
}
