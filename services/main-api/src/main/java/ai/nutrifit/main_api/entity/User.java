package ai.nutrifit.main_api.entity;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role;

    @Column(name = "weight_kg")
    private Float weightKg;

    @Column(name = "goal_calories")
    private Integer goalCalories;

    @Column(name = "goal_protein_g")
    private Float goalProteinG;

    @Column(name = "goal_carbs_g")
    private Float goalCarbsG;

    @Column(name = "goal_fat_g")
    private Float goalFatG;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    private void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Float getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Float weightKg) {
        this.weightKg = weightKg;
    }

    public Integer getGoalCalories() {
        return goalCalories;
    }

    public void setGoalCalories(Integer goalCalories) {
        this.goalCalories = goalCalories;
    }

    public Float getGoalProteinG() {
        return goalProteinG;
    }

    public void setGoalProteinG(Float goalProteinG) {
        this.goalProteinG = goalProteinG;
    }

    public Float getGoalCarbsG() {
        return goalCarbsG;
    }

    public void setGoalCarbsG(Float goalCarbsG) {
        this.goalCarbsG = goalCarbsG;
    }

    public Float getGoalFatG() {
        return goalFatG;
    }

    public void setGoalFatG(Float goalFatG) {
        this.goalFatG = goalFatG;
    }
}
