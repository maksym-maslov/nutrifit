package ai.nutrifit.main_api.shared.ratelimit;

import tools.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private static final String TOO_MANY_REQUESTS_MESSAGE = "Too many requests. Please try again later.";

    private static final Map<String, RateLimitEndpoint> URI_TO_ENDPOINT = Map.of(
            "/api/v1/auth/login", RateLimitEndpoint.AUTH_LOGIN,
            "/api/v1/auth/register", RateLimitEndpoint.AUTH_REGISTER,
            "/api/v1/auth/refresh", RateLimitEndpoint.AUTH_REFRESH,
            "/api/v1/auth/change-password", RateLimitEndpoint.AUTH_CHANGE_PASSWORD,
            "/api/v1/foods/search", RateLimitEndpoint.API_SEARCH,
            "/api/v1/recommendations", RateLimitEndpoint.API_RECOMMEND
    );

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper;

    public RateLimitInterceptor(RateLimitingService rateLimitingService, ObjectMapper objectMapper) {
        this.rateLimitingService = rateLimitingService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        Optional<RateLimitEndpoint> endpoint = resolveEndpoint(request.getRequestURI());
        if (endpoint.isEmpty()) {
            return true;
        }

        String clientIp = ClientIpResolver.resolveClientIp(request);
        Bucket bucket = rateLimitingService.resolveBucket(clientIp, endpoint.get());

        if (bucket.tryConsume(1)) {
            return true;
        }

        writeTooManyRequestsResponse(response);
        return false;
    }

    private Optional<RateLimitEndpoint> resolveEndpoint(String requestUri) {
        if (requestUri == null || requestUri.isBlank()) {
            return Optional.empty();
        }

        RateLimitEndpoint exactMatch = URI_TO_ENDPOINT.get(requestUri);
        if (exactMatch != null) {
            return Optional.of(exactMatch);
        }

        if (requestUri.startsWith("/api/v1/foods/search")) {
            return Optional.of(RateLimitEndpoint.API_SEARCH);
        }

        if (requestUri.startsWith("/api/v1/recommendations")) {
            return Optional.of(RateLimitEndpoint.API_RECOMMEND);
        }

        return Optional.empty();
    }

    private void writeTooManyRequestsResponse(HttpServletResponse response) throws IOException {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.TOO_MANY_REQUESTS,
                TOO_MANY_REQUESTS_MESSAGE
        );

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(objectMapper.writeValueAsString(problemDetail));
    }
}
