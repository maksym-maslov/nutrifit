package ai.nutrifit.main_api.recommendation;

import ai.nutrifit.main_api.recommendation.dto.MlRecommendationRequest;
import ai.nutrifit.main_api.recommendation.dto.MlRecommendationResponse;
import ai.nutrifit.main_api.shared.exception.MlApiClientException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class FastApiClientService {
    private final RestClient restClient;

    public FastApiClientService(@Qualifier("mlApiRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<Long> getRecommendations(MlRecommendationRequest request) {
        try {
            MlRecommendationResponse response = restClient.post()
                    .uri("/api/v1/recommend")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String responseBody = readResponseBody(res);
                        String message = "ML API returned " + res.getStatusCode();
                        if (!responseBody.isBlank()) {
                            message += ": " + responseBody;
                        }
                        throw new MlApiClientException(message, res.getStatusCode());
                    })
                    .body(MlRecommendationResponse.class);

            if (response == null || response.recommendedFoodIds() == null) {
                return List.of();
            }
            return response.recommendedFoodIds();
        } catch (MlApiClientException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new MlApiClientException("Failed to reach ML API", HttpStatus.BAD_GATEWAY, ex);
        }
    }

    private static String readResponseBody(org.springframework.http.client.ClientHttpResponse response) {
        try {
            return new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            return "";
        }
    }
}
