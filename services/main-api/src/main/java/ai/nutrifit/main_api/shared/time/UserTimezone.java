package ai.nutrifit.main_api.shared.time;

import ai.nutrifit.main_api.user.entity.User;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

public final class UserTimezone {
    public static final String DEFAULT_ZONE_ID = "Europe/Kyiv";

    private UserTimezone() {
    }

    public static ZoneId resolveZoneId(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return ZoneId.of(DEFAULT_ZONE_ID);
        }
        try {
            return ZoneId.of(timezone.trim());
        } catch (DateTimeException ex) {
            return ZoneId.of(DEFAULT_ZONE_ID);
        }
    }

    public static String normalizeTimezone(String timezone) {
        return resolveZoneId(timezone).getId();
    }

    public static UtcDayWindow dayWindowUtc(User user, LocalDate date) {
        ZoneId zoneId = resolveZoneId(user.getTimezone());
        ZonedDateTime start = date.atStartOfDay(zoneId);
        ZonedDateTime end = date.atTime(LocalTime.MAX).atZone(zoneId);
        LocalDateTime startUtc = LocalDateTime.ofInstant(start.toInstant(), ZoneOffset.UTC);
        LocalDateTime endUtc = LocalDateTime.ofInstant(end.toInstant(), ZoneOffset.UTC);
        return new UtcDayWindow(startUtc, endUtc);
    }

    public static LocalDateTime localWallTimeToUtc(LocalDateTime localWallTime, User user) {
        ZoneId zoneId = resolveZoneId(user.getTimezone());
        return localWallTime.atZone(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }

    public record UtcDayWindow(LocalDateTime startUtc, LocalDateTime endUtc) {
    }
}
