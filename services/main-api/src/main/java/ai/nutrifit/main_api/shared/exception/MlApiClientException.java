package ai.nutrifit.main_api.shared.exception;

import org.springframework.http.HttpStatusCode;

public class MlApiClientException extends RuntimeException {
    private final HttpStatusCode statusCode;

    public MlApiClientException(String message, HttpStatusCode statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public MlApiClientException(String message, HttpStatusCode statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}
