package ai.nutrifit.main_api.meal.entity;

import ai.nutrifit.main_api.user.entity.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meals")
public class Meal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealItem> items = new ArrayList<>();

    @PrePersist
    private void onCreate() {
        createdAt = LocalDateTime.ofInstant(Instant.now(), ZoneOffset.UTC);
    }

    public void addItem(MealItem item) {
        items.add(item);
        item.setMeal(this);
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(LocalDateTime loggedAt) {
        this.loggedAt = loggedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<MealItem> getItems() {
        return items;
    }
}
