
package com.hostelhub.service;

import com.hostelhub.model.Staff;
import com.hostelhub.repository.StaffRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(StaffRepository staffRepository,
                        PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<Staff> getStaffByEmail(String email) {
        return staffRepository.findByEmail(email);
    }

    public Optional<Staff> getStaffByEmployeeId(String employeeId) {
        return staffRepository.findByEmployeeId(employeeId);
    }

    public boolean employeeIdExists(String employeeId) {
        return staffRepository.existsByEmployeeId(employeeId);
    }

    // Get all staff members
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    // Assign an Employee ID to an existing staff member
    public Staff assignEmployeeId(String id, String employeeId) {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Staff member not found"));

        if (!"WARDEN".equalsIgnoreCase(staff.getRole())) {
            throw new IllegalArgumentException(
                    "Employee ID can only be assigned to a Warden");
        }

        if (employeeId == null || employeeId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Employee ID is required");
        }

        String cleanEmployeeId = employeeId.trim();

        Optional<Staff> existing =
                staffRepository.findByEmployeeId(cleanEmployeeId);

        if (existing.isPresent() &&
                !existing.get().getId().equals(id)) {
            throw new IllegalArgumentException(
                    "Employee ID already exists");
        }

        staff.setEmployeeId(cleanEmployeeId);

        return staffRepository.save(staff);
    }

    // Create a new staff member
    public Staff createStaff(Staff staff) {

        if (staff.getEmployeeId() != null &&
                staffRepository.existsByEmployeeId(staff.getEmployeeId())) {
            throw new RuntimeException("Employee ID already exists");
        }

        staff.setPasswordHash(
                passwordEncoder.encode(staff.getPasswordHash())
        );

        return staffRepository.save(staff);
    }
}

