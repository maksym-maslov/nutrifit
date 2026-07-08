package ai.nutrifit.main_api.shared.ratelimit;

import jakarta.servlet.http.HttpServletRequest;

public final class ClientIpResolver {
    private static final String X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String X_REAL_IP = "X-Real-IP";

    private ClientIpResolver() {
    }

    public static String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader(X_FORWARDED_FOR);
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String clientIp = extractFirstIp(forwardedFor);
            if (!clientIp.isBlank()) {
                return clientIp;
            }
        }

        String realIp = request.getHeader(X_REAL_IP);
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr : "unknown";
    }

    private static String extractFirstIp(String forwardedFor) {
        int commaIndex = forwardedFor.indexOf(',');
        if (commaIndex == -1) {
            return forwardedFor.trim();
        }
        return forwardedFor.substring(0, commaIndex).trim();
    }
}
