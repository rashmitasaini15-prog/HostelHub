
package com.hostelhub.repository;

import com.hostelhub.model.LeaveRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LeaveRequestRepository
        extends MongoRepository<LeaveRequest, String> {

    List<LeaveRequest> findByStudentEmail(String studentEmail);

}

