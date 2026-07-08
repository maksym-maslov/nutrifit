package ai.nutrifit.main_api.user.enums;

public enum ActivityLevel {
    SEDENTARY(1.2f),
    LIGHTLY_ACTIVE(1.375f),
    MODERATELY_ACTIVE(1.55f),
    VERY_ACTIVE(1.725f);

    private final float multiplier;

    ActivityLevel(float multiplier) {
        this.multiplier = multiplier;
    }

    public float getMultiplier() {
        return multiplier;
    }
}
