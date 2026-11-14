
package com.hostelhub.controller;

import com.hostelhub.model.Fee;
import com.hostelhub.service.FeeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "http://localhost:5173")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @PostMapping
    public Fee addFee(@RequestBody Fee fee) {
        return feeService.addFee(fee);
    }

    @GetMapping
    public List<Fee> getAllFees() {
        return feeService.getAllFees();
    }

    @GetMapping("/student/{email}")
    public ResponseEntity<List<Fee>> getStudentFees(
            @PathVariable String email,
            Authentication authentication) {

        String loggedInEmail = authentication.getName();

        boolean isStudent = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_STUDENT"));

        if (isStudent && !loggedInEmail.equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                feeService.getStudentFees(email)
        );
    }

    @PutMapping("/{id}/pay")
    public Fee markFeeAsPaid(@PathVariable String id) {
        return feeService.markFeeAsPaid(id);
    }
}

