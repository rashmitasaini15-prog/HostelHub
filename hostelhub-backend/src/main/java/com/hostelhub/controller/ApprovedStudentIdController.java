
package com.hostelhub.controller;

import com.hostelhub.model.ApprovedStudentId;
import com.hostelhub.service.ApprovedStudentIdService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approved-student-ids")
@CrossOrigin(origins = "http://localhost:5173")
public class ApprovedStudentIdController {

    private final ApprovedStudentIdService service;

    public ApprovedStudentIdController(
            ApprovedStudentIdService service) {
        this.service = service;
    }

    // Add an approved Student ID
    @PostMapping
    public ResponseEntity<?> addStudentId(
            @RequestBody Map<String, String> request) {

        String studentId = request.get("studentId");

        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Student ID is required");
        }

        try {
            ApprovedStudentId saved =
                    service.addStudentId(studentId.trim());

            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // Add an approved student with complete details
    @PostMapping("/details")
    public ResponseEntity<?> addStudent(
            @RequestBody ApprovedStudentId student) {

        try {
            ApprovedStudentId saved = service.addStudent(student);
            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // View all approved Student IDs
    @GetMapping
    public ResponseEntity<List<ApprovedStudentId>> getAllStudentIds() {
        return ResponseEntity.ok(service.getAllStudentIds());
    }

    // Remove an unused approved Student ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeStudentId(
            @PathVariable String id) {

        try {
            service.removeStudentId(id);

            return ResponseEntity.ok(
                    Map.of("message", "Student approval removed successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}

