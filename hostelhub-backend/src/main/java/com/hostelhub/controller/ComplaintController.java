
package com.hostelhub.controller;

import com.hostelhub.model.Complaint;
import com.hostelhub.service.ComplaintService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public Complaint submitComplaint(
            @RequestBody Complaint complaint,
            Authentication authentication) {

        // Use the email from the logged-in user's JWT
        complaint.setStudentEmail(authentication.getName());

        return complaintService.submitComplaint(complaint);
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    
    @GetMapping("/student/{email}")
    public ResponseEntity<List<Complaint>> getStudentComplaints(
            @PathVariable String email,
            Authentication authentication) {

        String loggedInEmail = authentication.getName();

        // Students can only view their own complaints
        if (authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_STUDENT"))
                && !loggedInEmail.equalsIgnoreCase(email)) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                complaintService.getStudentComplaints(email)
        );
    }
    
    @PutMapping("/{id}/status")
public ResponseEntity<Complaint> updateComplaintStatus(
        @PathVariable String id,
        @RequestBody Complaint updatedComplaint) {

    String status = updatedComplaint.getStatus();

    if (status == null ||
            !List.of("Pending", "In Progress", "Resolved").contains(status)) {
        return ResponseEntity.badRequest().build();
    }

    return complaintService.updateComplaintStatus(id, status)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
}

