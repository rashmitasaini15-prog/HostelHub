
package com.hostelhub.service;

import com.hostelhub.model.Complaint;
import com.hostelhub.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public Complaint submitComplaint(Complaint complaint) {
        complaint.setStatus("Pending");
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getStudentComplaints(String studentEmail) {
        return complaintRepository.findByStudentEmail(studentEmail);
    }

    public Optional<Complaint> updateComplaintStatus(String id, String status) {

    return complaintRepository.findById(id).map(complaint -> {
        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    });
}
}
