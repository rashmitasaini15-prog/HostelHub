
package com.hostelhub.controller;

import com.hostelhub.model.LeaveRequest;
import com.hostelhub.model.Student;
import com.hostelhub.service.LeaveRequestService;
import com.hostelhub.service.StudentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final StudentService studentService;

    public LeaveRequestController(
            LeaveRequestService leaveRequestService,
            StudentService studentService) {
        this.leaveRequestService = leaveRequestService;
        this.studentService = studentService;
    }

    // Student submits a leave request
    @PostMapping
    public ResponseEntity<?> submitRequest(
            @RequestBody LeaveRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        Student student = studentService.getStudentByEmail(email)
                .orElse(null);

        if (student == null) {
            return ResponseEntity.badRequest()
                    .body("Student account not found");
        }

        if (request.getDestination() == null
                || request.getDestination().isBlank()
                || request.getDepartureDate() == null
                || request.getExpectedReturnDate() == null) {
            return ResponseEntity.badRequest()
                    .body("Please provide destination and both dates");
        }

        if (request.getExpectedReturnDate()
                .isBefore(request.getDepartureDate())) {
            return ResponseEntity.badRequest()
                    .body("Return date cannot be before departure date");
        }

        request.setStudentName(student.getFullName());
        request.setStudentEmail(email);

        return ResponseEntity.ok(
                leaveRequestService.submitRequest(request));
    }

    // Warden and Admin view all requests
    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllRequests() {
        return ResponseEntity.ok(
                leaveRequestService.getAllRequests());
    }

    // Student views their own requests
    @GetMapping("/my")
    public ResponseEntity<List<LeaveRequest>> getStudentRequests(
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveRequestService.getStudentRequests(
                        authentication.getName()));
    }

    // Warden and Admin update request status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        if (status == null
                || !(status.equals("APPROVED")
                || status.equals("REJECTED"))) {
            return ResponseEntity.badRequest()
                    .body("Status must be APPROVED or REJECTED");
        }

        try {
            return ResponseEntity.ok(
                    leaveRequestService.updateStatus(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

