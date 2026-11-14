
package com.hostelhub.dto;

import com.hostelhub.model.Student;

public class StudentResponse {

    private String id;
    private String fullName;
    private String email;
    private String studentId;
    private String contactNumber;
    private int academicYear;
    private boolean active;

    public StudentResponse(Student student) {
        this.id = student.getId();
        this.fullName = student.getFullName();
        this.email = student.getEmail();
        this.studentId = student.getStudentId();
        this.contactNumber = student.getContactNumber();
        this.academicYear = student.getAcademicYear();
        this.active = student.isActive();
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

    public String getStudentId() {
        return studentId;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public int getAcademicYear() {
        return academicYear;
    }

    public boolean isActive() {
        return active;
    }
}

