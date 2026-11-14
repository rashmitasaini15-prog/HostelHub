
package com.hostelhub.repository;

import com.hostelhub.model.Staff;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StaffRepository extends MongoRepository<Staff, String> {

    Optional<Staff> findByEmail(String email);

    Optional<Staff> findByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);
}

