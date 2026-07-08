package ai.nutrifit.main_api.meal.entity;

import ai.nutrifit.main_api.catalog.entity.FoodDictionary;
import jakarta.persistence.*;

@Entity
@Table(name = "meal_items")
public class MealItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "food_id", nullable = false)
    private FoodDictionary food;

    @Column(name = "weight_g", nullable = false)
    private Float weightG;

    public Long getId() {
        return id;
    }

    public Meal getMeal() {
        return meal;
    }

    public void setMeal(Meal meal) {
        this.meal = meal;
    }

    public FoodDictionary getFood() {
        return food;
    }

    public void setFood(FoodDictionary food) {
        this.food = food;
    }

    public Float getWeightG() {
        return weightG;
    }

    public void setWeightG(Float weightG) {
        this.weightG = weightG;
    }
}
