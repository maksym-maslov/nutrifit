package ai.nutrifit.main_api.shared.time;

import ai.nutrifit.main_api.user.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;

class UserTimezoneTest {

    @Test
    void resolveZoneId_invalidFallsBackToKyiv() {
        assertThat(UserTimezone.resolveZoneId("Not/AZone").getId()).isEqualTo("Europe/Kyiv");
        assertThat(UserTimezone.resolveZoneId(null).getId()).isEqualTo("Europe/Kyiv");
        assertThat(UserTimezone.resolveZoneId("  ").getId()).isEqualTo("Europe/Kyiv");
    }

    @Test
    void resolveZoneId_validId() {
        assertThat(UserTimezone.resolveZoneId("America/New_York").getId()).isEqualTo("America/New_York");
    }

    @Test
    void dayWindowUtc_kyivSummerDate() {
        User user = new User();
        user.setTimezone("Europe/Kyiv");
        LocalDate date = LocalDate.of(2026, 7, 7);

        UserTimezone.UtcDayWindow window = UserTimezone.dayWindowUtc(user, date);

        assertThat(window.startUtc()).isEqualTo(LocalDateTime.of(2026, 7, 6, 21, 0));
        assertThat(window.endUtc()).isEqualTo(LocalDateTime.of(2026, 7, 7, 20, 59, 59, 999_999_999));
    }

    @Test
    void localWallTimeToUtc_convertsFromProfileTimezone() {
        User user = new User();
        user.setTimezone("Europe/Kyiv");
        LocalDateTime localWall = LocalDateTime.of(2026, 7, 7, 15, 0);

        LocalDateTime utc = UserTimezone.localWallTimeToUtc(localWall, user);

        assertThat(utc).isEqualTo(LocalDateTime.of(2026, 7, 7, 12, 0));
    }

    @Test
    void normalizeTimezone_returnsCanonicalId() {
        assertThat(UserTimezone.normalizeTimezone("UTC")).isEqualTo("UTC");
        assertThat(UserTimezone.normalizeTimezone("Invalid")).isEqualTo(ZoneId.of("Europe/Kyiv").getId());
    }
}
