package com.hostelhub.service;

import com.hostelhub.model.Staff;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StaffDataInitializer implements CommandLineRunner {

    private final StaffService staffService;

    public StaffDataInitializer(StaffService staffService) {
        this.staffService = staffService;
    }

    @Override
    public void run(String... args) {

        if (staffService.getStaffByEmail("warden@hostelhub.com").isEmpty()) {
            staffService.createStaff(
                    new Staff(
                            "Hostel Warden",
                            "warden@hostelhub.com",
                            "Warden@123",
                            "WARDEN"
                    )
            );
        }

        if (staffService.getStaffByEmail("admin@hostelhub.com").isEmpty()) {
            staffService.createStaff(
                    new Staff(
                            "Hostel Admin",
                            "admin@hostelhub.com",
                            "Admin@123",
                            "ADMIN"
                    )
            );
        }
    }
}

