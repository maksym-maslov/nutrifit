package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.OnboardingRequest;
import ai.nutrifit.main_api.dto.UpdateAccountRequest;
import ai.nutrifit.main_api.dto.UpdateProfileRequest;
import ai.nutrifit.main_api.dto.UserProfileSummaryDTO;
import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.repository.UserRepository;
import ai.nutrifit.main_api.security.AuthenticationFacade;
import ai.nutrifit.main_api.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {
    private final ProfileService profileService;
    private final AuthenticationFacade authenticationFacade;
    private final UserRepository userRepository;

    public ProfileController(
            ProfileService profileService,
            AuthenticationFacade authenticationFacade,
            UserRepository userRepository
    ) {
        this.profileService = profileService;
        this.authenticationFacade = authenticationFacade;
        this.userRepository = userRepository;
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

    private User getCurrentUser() {
        Long userId = authenticationFacade.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
