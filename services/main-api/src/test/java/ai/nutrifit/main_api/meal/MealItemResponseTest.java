package ai.nutrifit.main_api.meal;

import ai.nutrifit.main_api.catalog.entity.FoodDictionary;
import ai.nutrifit.main_api.meal.dto.MealItemResponse;
import ai.nutrifit.main_api.meal.entity.MealItem;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MealItemResponseTest {
    private static MealItem mealItem(int caloriesPer100g,
                                     float proteinPer100g, float carbsPer100g, float fatPer100g,
                                     float weightG) {
        FoodDictionary food = new FoodDictionary();
        food.setName("Test Food");
        food.setCaloriesPer100g(caloriesPer100g);
        food.setProteinPer100g(proteinPer100g);
        food.setCarbsPer100g(carbsPer100g);
        food.setFatPer100g(fatPer100g);

        MealItem item = new MealItem();
        item.setFood(food);
        item.setWeightG(weightG);
        return item;
    }

    @Test
    void caloriesAreRoundedToInt() {
        // 347 cal/100g × 150g = 520.5 → Math.round → 521, not truncated to 520
        MealItemResponse result = MealItemResponse.from(mealItem(347, 20f, 10f, 5f, 150f));

        assertThat(result.itemCalories()).isEqualTo(521);
    }

    @Test
    void macrosScaleProportionally() {
        // 20g protein/100g × 75g = 15.0g; 30g carbs/100g × 75g = 22.5g; 10g fat/100g × 75g = 7.5g
        MealItemResponse result = MealItemResponse.from(mealItem(200, 20f, 30f, 10f, 75f));

        assertThat(result.itemProtein()).isEqualTo(15.0f);
        assertThat(result.itemCarbs()).isEqualTo(22.5f);
        assertThat(result.itemFat()).isEqualTo(7.5f);
    }

    @Test
    void caloriesAreRoundedNotTruncatedForSmallPortion() {
        // 100 cal/100g × 35g = 35.0 exactly → should equal 35 (tests Math.round vs int cast)
        MealItemResponse result = MealItemResponse.from(mealItem(100, 10f, 10f, 5f, 35f));

        assertThat(result.itemCalories()).isEqualTo(35);
    }
}
