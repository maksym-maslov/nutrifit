package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.OnboardingRequest;
import ai.nutrifit.main_api.dto.UserProfileSummaryDTO;
import ai.nutrifit.main_api.entity.User;
import ai.nutrifit.main_api.repository.UserRepository;
import ai.nutrifit.main_api.security.AuthenticationFacade;
import ai.nutrifit.main_api.service.ProfileOnboardingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {
    private final ProfileOnboardingService profileOnboardingService;
    private final AuthenticationFacade authenticationFacade;
    private final UserRepository userRepository;

    public ProfileController(
            ProfileOnboardingService profileOnboardingService,
            AuthenticationFacade authenticationFacade,
            UserRepository userRepository
    ) {
        this.profileOnboardingService = profileOnboardingService;
        this.authenticationFacade = authenticationFacade;
        this.userRepository = userRepository;
    }

    @PutMapping("/onboarding")
    public ResponseEntity<UserProfileSummaryDTO> completeOnboarding(
            @Valid @RequestBody OnboardingRequest request
    ) {
        Long userId = authenticationFacade.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfileSummaryDTO response = profileOnboardingService.completeOnboarding(user, request);
        return ResponseEntity.ok(response);
    }
}
