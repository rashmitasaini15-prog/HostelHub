
package com.hostelhub.controller;

import com.hostelhub.service.StudentService;
import com.hostelhub.dto.LoginRequest;
import com.hostelhub.dto.LoginResponse;
import com.hostelhub.model.Staff;
import com.hostelhub.model.Student;
import com.hostelhub.service.StaffService;
import com.hostelhub.util.JwtUtil;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final StudentService studentService;
    private final StaffService staffService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(
            StudentService studentService,
            StaffService staffService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {

        this.studentService = studentService;
        this.staffService = staffService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        String loginId = request.getLoginId().trim();
        String password = request.getPassword();
        String role = request.getRole().toUpperCase();

        // STUDENT LOGIN - Student ID + Password
        if (role.equals("STUDENT")) {

            Optional<Student> student =
                    studentService.getStudentByStudentId(loginId);

            if (student.isEmpty()) {
                return unauthorized();
            }

            Student user = student.get();

            if (user.getRole() == null ||
                    !user.getRole().equalsIgnoreCase("STUDENT")) {
                return unauthorized();
            }

            // Check whether Admin has deactivated this account
            if (!user.isActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new LoginResponse(
                                null,
                                "Your account has been deactivated. Please contact the Admin."));
            }

            if (!passwordEncoder.matches(
                    password, user.getPasswordHash())) {
                return unauthorized();
            }

            String token = jwtUtil.generateToken(
                    user.getEmail(), "STUDENT");

            return ResponseEntity.ok(
                    new LoginResponse(
                            token, "Login successful", "STUDENT"));
        }

        // WARDEN LOGIN - Employee ID + Password
        if (role.equals("WARDEN")) {

            Optional<Staff> staff =
                    staffService.getStaffByEmployeeId(loginId);

            if (staff.isEmpty()) {
                return unauthorized();
            }

            Staff user = staff.get();

            if (!passwordEncoder.matches(
                    password, user.getPasswordHash())) {
                return unauthorized();
            }

            if (!user.getRole().equalsIgnoreCase("WARDEN")) {
                return unauthorized();
            }

            String token = jwtUtil.generateToken(
                    user.getEmail(), "WARDEN");

            return ResponseEntity.ok(
                    new LoginResponse(
                            token, "Login successful", "WARDEN"));
        }

        // ADMIN LOGIN - Email + Password
        if (role.equals("ADMIN")) {

            Optional<Staff> staff =
                    staffService.getStaffByEmail(loginId);

            if (staff.isEmpty()) {
                return unauthorized();
            }

            Staff user = staff.get();

            if (!passwordEncoder.matches(
                    password, user.getPasswordHash())) {
                return unauthorized();
            }

            if (!user.getRole().equalsIgnoreCase("ADMIN")) {
                return unauthorized();
            }

            String token = jwtUtil.generateToken(
                    user.getEmail(), "ADMIN");

            return ResponseEntity.ok(
                    new LoginResponse(
                            token, "Login successful", "ADMIN"));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new LoginResponse(
                        null, "Invalid account role"));
    }

    private ResponseEntity<LoginResponse> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new LoginResponse(
                        null, "Invalid login ID or password"));
    }
}

