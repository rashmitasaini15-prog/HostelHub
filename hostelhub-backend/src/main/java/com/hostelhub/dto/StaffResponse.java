
package com.hostelhub.dto;

import com.hostelhub.model.Staff;

public class StaffResponse {

    private String id;
    private String fullName;
    private String email;
    private String employeeId;
    private String role;

    public StaffResponse(Staff staff) {
        this.id = staff.getId();
        this.fullName = staff.getFullName();
        this.email = staff.getEmail();
        this.employeeId = staff.getEmployeeId();
        this.role = staff.getRole();
    }

    public String getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getRole() {
        return role;
    }
}

