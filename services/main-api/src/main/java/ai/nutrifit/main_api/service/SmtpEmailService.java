package ai.nutrifit.main_api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(SmtpEmailService.class);

    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public SmtpEmailService(
            JavaMailSender mailSender,
            @Value("${app.frontend.url}") String frontendUrl
    ) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    @Override
    @Async
    public void sendVerificationEmail(String to, String token) {
        String verificationLink = frontendUrl + "/verify?token=" + token;

        String htmlBody = """
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; background-color: #0f1117; color: #e2e8f0; padding: 40px;">
                  <div style="max-width: 520px; margin: 0 auto; background-color: #1a1d27; border-radius: 12px; padding: 40px;">
                    <h1 style="color: #4ade80; margin-bottom: 8px;">Verify your email</h1>
                    <p style="color: #94a3b8; margin-bottom: 24px;">
                      Thanks for signing up for NutriFit! Click the button below to verify your email address.
                      This link expires in <strong style="color: #e2e8f0;">24 hours</strong>.
                    </p>
                    <a href="%s"
                       style="display: inline-block; background-color: #4ade80; color: #0f1117;
                              text-decoration: none; padding: 14px 28px; border-radius: 8px;
                              font-weight: bold; font-size: 15px;">
                      Verify Email Address
                    </a>
                    <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
                      If you didn't create a NutriFit account, you can safely ignore this email.
                    </p>
                  </div>
                </body>
                </html>
                """.formatted(verificationLink);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Verify your NutriFit email address");
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        String htmlBody = """
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; background-color: #0f1117; color: #e2e8f0; padding: 40px;">
                  <div style="max-width: 520px; margin: 0 auto; background-color: #1a1d27; border-radius: 12px; padding: 40px;">
                    <h1 style="color: #4ade80; margin-bottom: 8px;">Reset your password</h1>
                    <p style="color: #94a3b8; margin-bottom: 24px;">
                      We received a request to reset your NutriFit password. Click the button below to choose a new password.
                      This link expires in <strong style="color: #e2e8f0;">15 minutes</strong>.
                    </p>
                    <a href="%s"
                       style="display: inline-block; background-color: #4ade80; color: #0f1117;
                              text-decoration: none; padding: 14px 28px; border-radius: 8px;
                              font-weight: bold; font-size: 15px;">
                      Reset Password
                    </a>
                    <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
                      If you didn't request a password reset, you can safely ignore this email.
                    </p>
                  </div>
                </body>
                </html>
                """.formatted(resetLink);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Reset your NutriFit password");
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage(), e);
        }
    }
}
