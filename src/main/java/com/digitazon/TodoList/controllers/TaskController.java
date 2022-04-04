package com.digitazon.TodoList.controllers;

import com.digitazon.TodoList.entities.Category;
import com.digitazon.TodoList.entities.Task;
import com.digitazon.TodoList.repositories.CategoryRepository;
import com.digitazon.TodoList.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping("/")
    public Iterable<Task> home() {
        Iterable<Task> tasks = taskRepository.findAll();
        System.out.println(tasks);
        return tasks;
    }

    @GetMapping("/{id}")
    public Task read(@PathVariable int id) {
        return taskRepository.findById(id).orElseThrow();
    }

    @PostMapping("/add")
    public Task create(@RequestBody Task newTask) {
        System.out.println(newTask);
        Task savedTask = taskRepository.save(newTask);
        Category category = categoryRepository.findById(savedTask.getCategory().getId()).orElseThrow();
        savedTask.setCategory(category);
        return savedTask;
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) {
        taskRepository.deleteById(id);
        return "ok";
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable int id, @RequestBody Task updatedTask) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow();
        if (task.isDone()) {
            throw new Exception("cannot update done task");
        }
        task.setName(updatedTask.getName());
        return taskRepository.save(task);
    }

    @PutMapping("/{id}/set-done")
    public Task setDone(@PathVariable int id, @RequestBody Task updatedTask) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setDone(updatedTask.isDone());
        return taskRepository.save(task);
    }

    @DeleteMapping("/delete-all")
    public String deleteAll() {
        taskRepository.deleteAll();
        return "ok";
    }
}
