package ai.nutrifit.main_api.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "food_dictionary")
public class FoodDictionary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String brand;

    @Column(name = "calories_per_100g", nullable = false)
    private Integer caloriesPer100g;

    @Column(name = "protein_per_100g", nullable = false)
    private Float proteinPer100g;

    @Column(name = "carbs_per_100g", nullable = false)
    private Float carbsPer100g;

    @Column(name = "fat_per_100g", nullable = false)
    private Float fatPer100g;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    private void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Integer getCaloriesPer100g() {
        return caloriesPer100g;
    }

    public void setCaloriesPer100g(Integer caloriesPer100g) {
        this.caloriesPer100g = caloriesPer100g;
    }

    public Float getProteinPer100g() {
        return proteinPer100g;
    }

    public void setProteinPer100g(Float proteinPer100g) {
        this.proteinPer100g = proteinPer100g;
    }

    public Float getCarbsPer100g() {
        return carbsPer100g;
    }

    public void setCarbsPer100g(Float carbsPer100g) {
        this.carbsPer100g = carbsPer100g;
    }

    public Float getFatPer100g() {
        return fatPer100g;
    }

    public void setFatPer100g(Float fatPer100g) {
        this.fatPer100g = fatPer100g;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
