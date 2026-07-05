package ai.nutrifit.main_api.service;

import ai.nutrifit.main_api.dto.MlRecommendationRequest;
import ai.nutrifit.main_api.dto.MlRecommendationResponse;
import ai.nutrifit.main_api.exception.MlApiClientException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

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
                        throw new MlApiClientException(
                                "ML API returned " + res.getStatusCode(),
                                res.getStatusCode()
                        );
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
}
