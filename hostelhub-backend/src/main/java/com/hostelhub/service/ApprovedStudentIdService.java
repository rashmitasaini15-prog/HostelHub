
package com.hostelhub.service;

import com.hostelhub.model.ApprovedStudentId;
import com.hostelhub.repository.ApprovedStudentIdRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApprovedStudentIdService {

    private final ApprovedStudentIdRepository repository;

    public ApprovedStudentIdService(
            ApprovedStudentIdRepository repository) {
        this.repository = repository;
    }

    // Add a new approved student with complete details
    public ApprovedStudentId addStudent(ApprovedStudentId student) {

        if (student.getStudentId() == null ||
                student.getStudentId().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Student ID is required");
        }

        if (student.getFullName() == null ||
                student.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Student name is required");
        }

        if (student.getEmail() == null ||
                student.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Student email is required");
        }

        if (student.getContactNumber() == null ||
                student.getContactNumber().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Contact number is required");
        }

        String cleanStudentId = student.getStudentId().trim();

        if (repository.existsByStudentId(cleanStudentId)) {
            throw new IllegalArgumentException(
                    "Student ID is already approved");
        }

        student.setStudentId(cleanStudentId);
        student.setFullName(student.getFullName().trim());
        student.setEmail(student.getEmail().trim());
        student.setContactNumber(student.getContactNumber().trim());
        student.setUsed(false);

        return repository.save(student);
    }

    // Keep the existing method for compatibility
    public ApprovedStudentId addStudentId(String studentId) {

        if (repository.existsByStudentId(studentId)) {
            throw new IllegalArgumentException(
                    "Student ID is already approved");
        }

        return repository.save(new ApprovedStudentId(studentId));
    }

    // Get all approved Student IDs
    public List<ApprovedStudentId> getAllStudentIds() {
        return repository.findAll();
    }

    // Remove an approved Student ID
    public void removeStudentId(String id) {

        ApprovedStudentId student = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Approved Student ID not found"));

        if (student.isUsed()) {
            throw new IllegalArgumentException(
                    "This Student ID is already used and cannot be removed here");
        }

        repository.delete(student);
    }
}

