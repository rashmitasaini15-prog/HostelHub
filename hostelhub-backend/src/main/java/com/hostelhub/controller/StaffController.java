
package com.hostelhub.controller;

import com.hostelhub.dto.StaffResponse;
import com.hostelhub.model.Staff;
import com.hostelhub.service.StaffService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    // Get all staff members
    @GetMapping
    public ResponseEntity<List<StaffResponse>> getAllStaff() {

        List<StaffResponse> staffList =
                staffService.getAllStaff()
                        .stream()
                        .map(StaffResponse::new)
                        .toList();

        return ResponseEntity.ok(staffList);
    }

    // Assign Employee ID to a Warden
    @PutMapping("/{id}/employee-id")
    public ResponseEntity<?> assignEmployeeId(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        String employeeId = request.get("employeeId");

        try {
            Staff staff =
                    staffService.assignEmployeeId(id, employeeId);

            return ResponseEntity.ok(new StaffResponse(staff));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", e.getMessage()));
        }
    }
}

