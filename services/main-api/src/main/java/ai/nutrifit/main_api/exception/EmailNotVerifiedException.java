package ai.nutrifit.main_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class EmailNotVerifiedException extends ResponseStatusException {
    public EmailNotVerifiedException() {
        super(HttpStatus.FORBIDDEN, "Email address not verified. Please check your inbox.");
    }
}
