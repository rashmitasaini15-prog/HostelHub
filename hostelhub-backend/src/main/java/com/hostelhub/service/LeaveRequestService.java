
package com.hostelhub.service;

import com.hostelhub.model.LeaveRequest;
import com.hostelhub.repository.LeaveRequestRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository repository;

    public LeaveRequestService(LeaveRequestRepository repository) {
        this.repository = repository;
    }

    public LeaveRequest submitRequest(LeaveRequest request) {
        request.setStatus("PENDING");
        return repository.save(request);
    }

    public List<LeaveRequest> getAllRequests() {
        return repository.findAll();
    }

    public List<LeaveRequest> getStudentRequests(String email) {
        return repository.findByStudentEmail(email);
    }

    public LeaveRequest updateStatus(String id, String status) {
        LeaveRequest request = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Leave request not found"));

        request.setStatus(status);
        return repository.save(request);
    }
}

