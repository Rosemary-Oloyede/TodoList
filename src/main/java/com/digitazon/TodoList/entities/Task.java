package com.digitazon.TodoList.entities;

import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String name;
    private LocalDateTime created;
    private boolean done;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    public Task() {

    }

    public Task(int id, String name, LocalDateTime created, boolean done, Category category) {
        this.id = id;
        this.name = name;
        this.created = created;
        this.done = done;
        this.category = category;
    }

    public Category getCategory() {
        return category;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreated() {
        return created;
    }

    public void setCreated(LocalDateTime created) {
        this.created = created;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
