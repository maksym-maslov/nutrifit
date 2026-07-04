package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.LoginRequest;
import ai.nutrifit.main_api.dto.RegisterRequest;
import ai.nutrifit.main_api.dto.TokenResponse;
import ai.nutrifit.main_api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}
