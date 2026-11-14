
package com.hostelhub.repository;

import com.hostelhub.model.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {

    List<Complaint> findByStudentEmail(String studentEmail);

}

