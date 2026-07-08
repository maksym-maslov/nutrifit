package ai.nutrifit.main_api.auth;

import ai.nutrifit.main_api.auth.dto.TokenResponse;
import ai.nutrifit.main_api.shared.config.SecurityConfig;
import ai.nutrifit.main_api.shared.security.AuthenticationFacade;
import ai.nutrifit.main_api.summary.DailySummaryController;
import ai.nutrifit.main_api.summary.DailySummaryService;
import ai.nutrifit.main_api.summary.dto.DailySummaryResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({AuthController.class, DailySummaryController.class})
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
        "cors.allowed-origins=http://localhost:5173",
        "app.cookie.secure=false"
})
class AuthSecurityTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private AuthService authService;
    @MockitoBean private DailySummaryService dailySummaryService;
    @MockitoBean private AuthenticationFacade authenticationFacade;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    void protectedEndpointWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/daily-summary").param("date", "2026-07-07"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithValidJwtReturns200() throws Exception {
        when(dailySummaryService.getDailySummary(any(LocalDate.class)))
                .thenReturn(emptySummary());

        mockMvc.perform(get("/api/v1/daily-summary")
                        .param("date", "2026-07-07")
                        .with(jwt().jwt(j -> j.claim("user_id", 1L).claim("scope", "ROLE_USER"))))
                .andExpect(status().isOk());
    }

    @Test
    void publicAuthEndpointIsAccessibleWithoutToken() throws Exception {
        // /api/v1/auth/** is permitAll — register should not return 401
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@test.com","password":"password123","fullName":"Test User"}
                                """))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void loginResponsePropagatesHttpOnlyRefreshCookieHeader() throws Exception {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "test-refresh-token")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        when(authService.login(any())).thenReturn(
                ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .body(new TokenResponse("access-token")));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"user@test.com","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=test-refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Path=/api/v1/auth")));
    }

    @Test
    void logoutClearsRefreshCookieWithoutJwt() throws Exception {
        ResponseCookie clearedCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();

        when(authService.buildLogoutCookie()).thenReturn(clearedCookie);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "test-token")))
                .andExpect(status().isNoContent())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Path=/api/v1/auth")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")));
    }

    @Test
    void forgotPasswordEndpointIsAccessibleWithoutToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"user@test.com"}
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void resetPasswordEndpointIsAccessibleWithoutToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"reset-token","newPassword":"password123"}
                                """))
                .andExpect(status().isOk());
    }

    // --- Helpers ---

    private DailySummaryResponse emptySummary() {
        return new DailySummaryResponse(
                LocalDate.of(2026, 7, 7),
                0, 0f, 0f, 0f,
                0,
                2000, 150f, 250f, 65f,
                2000, 150f, 250f, 65f
        );
    }
}
