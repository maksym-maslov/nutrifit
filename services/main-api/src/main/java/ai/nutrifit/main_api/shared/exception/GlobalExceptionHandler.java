package ai.nutrifit.main_api.shared.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> handleResponseStatusException(ResponseStatusException ex) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason());
        return ResponseEntity.status(ex.getStatusCode()).body(detail);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
        return ResponseEntity.badRequest().body(detail);
    }

    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<ProblemDetail> handleMissingCookie(MissingRequestCookieException ex) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Required cookie '" + ex.getCookieName() + "' is missing"
        );
        return ResponseEntity.badRequest().body(detail);
    }

    @ExceptionHandler(MlApiClientException.class)
    public ResponseEntity<ProblemDetail> handleMlApiClientException(MlApiClientException ex) {
        log.warn("ML API client error: {}", ex.getMessage(), ex);
        String detail = ex.getStatusCode() != null
                ? ex.getMessage() + " (upstream: " + ex.getStatusCode() + ")"
                : ex.getMessage();
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_GATEWAY, detail);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(problemDetail);
    }
}
