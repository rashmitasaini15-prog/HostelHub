
package com.hostelhub.controller;

import com.hostelhub.dto.StudentRegistrationRequest;
import com.hostelhub.dto.StudentResponse;
import com.hostelhub.model.Student;
import com.hostelhub.service.StudentService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private static final Logger logger =
            LoggerFactory.getLogger(StudentController.class);

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // Register a new student
    @PostMapping("/register")
    public ResponseEntity<StudentResponse> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest request) {

        logger.info("Received student registration request");

        Student savedStudent = studentService.registerStudent(request);

        return ResponseEntity.ok(new StudentResponse(savedStudent));
    }

    // Get logged-in student's profile
    @GetMapping("/profile")
    public ResponseEntity<StudentResponse> getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        logger.info("Fetching profile for logged-in student");

        return studentService.getStudentByEmail(email)
                .map(student ->
                        ResponseEntity.ok(new StudentResponse(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all students
    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {

        logger.info("Fetching all students");

        List<StudentResponse> students =
                studentService.getAllStudents()
                        .stream()
                        .map(StudentResponse::new)
                        .toList();

        return ResponseEntity.ok(students);
    }

    // Get students with pagination and sorting
    @GetMapping("/page")
    public ResponseEntity<org.springframework.data.domain.Page<StudentResponse>>
            getStudentsWithPagination(
                    @RequestParam(defaultValue = "0") int page,
                    @RequestParam(defaultValue = "5") int size,
                    @RequestParam(defaultValue = "fullName") String sortBy) {

        logger.info("Fetching students with pagination");

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(
                        page,
                        size,
                        org.springframework.data.domain.Sort.by(sortBy).ascending()
                );

        var students = studentService.getAllStudents(pageable)
                .map(StudentResponse::new);

        return ResponseEntity.ok(students);
    }

    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(
            @PathVariable String id) {

        logger.info("Fetching student with ID: {}", id);

        return studentService.getStudentById(id)
                .map(student ->
                        ResponseEntity.ok(new StudentResponse(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Update student's academic year (Admin only)
    @PutMapping("/{id}/academic-year")
    public ResponseEntity<Void> updateAcademicYear(
            @PathVariable String id,
            @RequestBody Map<String, Integer> request) {

        Integer academicYear = request.get("academicYear");

        if (academicYear == null ||
                academicYear < 1 || academicYear > 4) {
            return ResponseEntity.badRequest().build();
        }

        logger.info("Updating academic year for student ID: {}", id);

        studentService.updateAcademicYear(id, academicYear);

        return ResponseEntity.noContent().build();
    }

    // Deactivate student account (Admin only)
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateStudent(
            @PathVariable String id) {

        try {
            studentService.deactivateStudent(id);

            return ResponseEntity.ok(
                    Map.of("message", "Student account deactivated successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Reactivate student account (Admin only)
    @PutMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateStudent(
            @PathVariable String id) {

        try {
            studentService.reactivateStudent(id);

            return ResponseEntity.ok(
                    Map.of("message", "Student account reactivated successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(
            @PathVariable String id) {

        logger.info("Deleting student with ID: {}", id);

        studentService.deleteStudent(id);

        return ResponseEntity.noContent().build();
    }
}

