
package com.hostelhub.repository;

import com.hostelhub.model.ApprovedStudentId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ApprovedStudentIdRepository
        extends MongoRepository<ApprovedStudentId, String> {

    Optional<ApprovedStudentId> findByStudentId(String studentId);

    boolean existsByStudentId(String studentId);

    // Find approved IDs that have not been used for registration
    Optional<ApprovedStudentId> findByStudentIdAndUsedFalse(String studentId);
}

