package ai.nutrifit.main_api.profile.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateAccountRequest(
        @NotBlank String fullName
) {
}
