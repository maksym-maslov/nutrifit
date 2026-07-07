package ai.nutrifit.main_api.service;

public interface EmailService {
    void sendVerificationEmail(String to, String token);
}
