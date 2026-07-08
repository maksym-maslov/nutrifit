package ai.nutrifit.main_api.shared.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.EnumMap;
import java.util.Map;

@Service
public class RateLimitingService {
    private final Map<RateLimitEndpoint, Cache<String, Bucket>> bucketCaches;

    public RateLimitingService() {
        bucketCaches = new EnumMap<>(RateLimitEndpoint.class);
        for (RateLimitEndpoint endpoint : RateLimitEndpoint.values()) {
            bucketCaches.put(endpoint, createBucketCache());
        }
    }

    public Bucket resolveBucket(String identifier, RateLimitEndpoint endpointType) {
        Cache<String, Bucket> cache = bucketCaches.get(endpointType);
        return cache.get(identifier, key -> createBucketForEndpoint(endpointType));
    }

    Bucket getAuthLoginBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(5)
                        .refillGreedy(5, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    Bucket getAuthRegisterBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(3)
                        .refillGreedy(3, Duration.ofHours(1))
                        .build())
                .build();
    }

    Bucket getAuthRefreshBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(20)
                        .refillGreedy(20, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    Bucket getAuthChangePasswordBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(5)
                        .refillGreedy(5, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    Bucket getApiSearchBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(60)
                        .refillGreedy(60, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    Bucket getApiRecommendBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(15)
                        .refillGreedy(15, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    private Bucket createBucketForEndpoint(RateLimitEndpoint endpointType) {
        return switch (endpointType) {
            case AUTH_LOGIN -> getAuthLoginBucket();
            case AUTH_REGISTER -> getAuthRegisterBucket();
            case AUTH_REFRESH -> getAuthRefreshBucket();
            case AUTH_CHANGE_PASSWORD -> getAuthChangePasswordBucket();
            case API_SEARCH -> getApiSearchBucket();
            case API_RECOMMEND -> getApiRecommendBucket();
        };
    }

    private Cache<String, Bucket> createBucketCache() {
        return Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterAccess(Duration.ofHours(2))
                .build();
    }
}
