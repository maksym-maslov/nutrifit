package ai.nutrifit.main_api.catalog.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exercise_dictionary")
public class ExerciseDictionary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "met_value", nullable = false)
    private Float metValue;

    @Column(nullable = false)
    private String category;

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

    public Float getMetValue() {
        return metValue;
    }

    public void setMetValue(Float metValue) {
        this.metValue = metValue;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
