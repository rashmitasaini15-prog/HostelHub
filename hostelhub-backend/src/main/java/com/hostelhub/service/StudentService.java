
package com.hostelhub.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hostelhub.dto.StudentRegistrationRequest;
import com.hostelhub.model.Student;
import com.hostelhub.model.ApprovedStudentId;
import com.hostelhub.repository.StudentRepository;
import com.hostelhub.repository.ApprovedStudentIdRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private static final Logger logger =
            LoggerFactory.getLogger(StudentService.class);

    private final StudentRepository studentRepository;
    private final ApprovedStudentIdRepository approvedIdRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(
            StudentRepository studentRepository,
            ApprovedStudentIdRepository approvedIdRepository,
            PasswordEncoder passwordEncoder) {

        this.studentRepository = studentRepository;
        this.approvedIdRepository = approvedIdRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Register a new student using Admin-approved details
    public Student registerStudent(StudentRegistrationRequest request) {

        logger.info("Student registration started");

        String studentId = request.getStudentId().trim();

        ApprovedStudentId approvedId =
                approvedIdRepository.findByStudentId(studentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student ID is not approved by the Admin"));

        if (approvedId.isUsed()) {
            throw new IllegalArgumentException(
                    "This Student ID has already been used");
        }

        if (approvedId.getFullName() == null ||
                approvedId.getFullName().isBlank() ||
                approvedId.getEmail() == null ||
                approvedId.getEmail().isBlank() ||
                approvedId.getContactNumber() == null ||
                approvedId.getContactNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "Complete student details have not been added by Admin");
        }

        if (studentRepository.existsByStudentId(studentId)) {
            throw new IllegalArgumentException(
                    "Student ID is already registered");
        }

        String email = approvedId.getEmail().trim();

        if (studentRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "This email is already registered");
        }

        Student student = new Student();

        student.setFullName(approvedId.getFullName().trim());
        student.setEmail(email);
        student.setStudentId(studentId);
        student.setContactNumber(
                approvedId.getContactNumber().trim());

        student.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        student.setActive(true);

        Student savedStudent = studentRepository.save(student);

        approvedId.setUsed(true);
        approvedIdRepository.save(approvedId);

        logger.info("Student registered successfully");

        return savedStudent;
    }

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get students with pagination and sorting
    public Page<Student> getAllStudents(Pageable pageable) {
        return studentRepository.findAll(pageable);
    }

    // Find student by MongoDB ID using cache
    @Cacheable(value = "students", key = "#id")
    public Optional<Student> getStudentById(String id) {
        logger.info("Fetching student from MongoDB with ID: {}", id);
        return studentRepository.findById(id);
    }

    // Find student by email
    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    // Find student by Student ID - used for login
    public Optional<Student> getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    // Update student's academic year
    @CacheEvict(value = "students", key = "#id")
    public void updateAcademicYear(String id, int academicYear) {

        if (academicYear < 1 || academicYear > 4) {
            throw new IllegalArgumentException(
                    "Academic year must be between 1 and 4");
        }

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        student.setAcademicYear(academicYear);
        studentRepository.save(student);

        logger.info("Academic year updated successfully for student: {}", id);
    }

    // Deactivate a student's account
    @CacheEvict(value = "students", key = "#id")
    public void deactivateStudent(String id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found"));

        student.setActive(false);
        studentRepository.save(student);

        logger.info("Student account deactivated: {}", id);
    }

    // Reactivate a student's account
    @CacheEvict(value = "students", key = "#id")
    public void reactivateStudent(String id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found"));

        student.setActive(true);
        studentRepository.save(student);

        logger.info("Student account reactivated: {}", id);
    }

    // Delete student and remove cached data
    @CacheEvict(value = "students", key = "#id")
    public void deleteStudent(String id) {
        logger.info("Deleting student with ID: {}", id);
        studentRepository.deleteById(id);
    }
}

