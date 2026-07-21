package ai.nutrifit.main_api.profile;

import ai.nutrifit.main_api.auth.AuthService;
import ai.nutrifit.main_api.profile.dto.OnboardingRequest;
import ai.nutrifit.main_api.profile.dto.UpdateAccountRequest;
import ai.nutrifit.main_api.profile.dto.UpdateEmailRequest;
import ai.nutrifit.main_api.profile.dto.UpdateProfileRequest;
import ai.nutrifit.main_api.profile.dto.UserProfileSummaryDTO;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import ai.nutrifit.main_api.user.entity.User;
import ai.nutrifit.main_api.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {
    private final ProfileService profileService;
    private final AuthenticationFacade authenticationFacade;
    private final UserRepository userRepository;
    private final AuthService authService;

    public ProfileController(
            ProfileService profileService,
            AuthenticationFacade authenticationFacade,
            UserRepository userRepository,
            AuthService authService
    ) {
        this.profileService = profileService;
        this.authenticationFacade = authenticationFacade;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileSummaryDTO> getProfile() {
        User user = getCurrentUser();
        return ResponseEntity.ok(UserProfileSummaryDTO.from(user));
    }

    @PutMapping("/onboarding")
    public ResponseEntity<UserProfileSummaryDTO> completeOnboarding(
            @Valid @RequestBody OnboardingRequest request
    ) {
        User user = getCurrentUser();
        UserProfileSummaryDTO response = profileService.completeOnboarding(user, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileSummaryDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        User user = getCurrentUser();
        UserProfileSummaryDTO response = profileService.updateProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me/account")
    public ResponseEntity<UserProfileSummaryDTO> updateAccount(
            @Valid @RequestBody UpdateAccountRequest request
    ) {
        User user = getCurrentUser();
        UserProfileSummaryDTO response = profileService.updateAccount(user, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me/email")
    public ResponseEntity<Map<String, String>> updateEmail(
            @Valid @RequestBody UpdateEmailRequest request
    ) {
        profileService.updateEmail(request.newEmail());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authService.buildLogoutCookie().toString())
                .body(Map.of("message", "Email updated successfully. Please verify your new email address."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUser() {
        profileService.deleteCurrentUser();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authService.buildLogoutCookie().toString())
                .build();
    }

    private User getCurrentUser() {
        Long userId = authenticationFacade.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
