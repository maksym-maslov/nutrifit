package ai.nutrifit.main_api.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateAccountRequest(
        @NotBlank String fullName
) {
}
