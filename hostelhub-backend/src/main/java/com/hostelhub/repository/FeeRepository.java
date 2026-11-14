
package com.hostelhub.repository;

import com.hostelhub.model.Fee;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FeeRepository extends MongoRepository<Fee, String> {

    List<Fee> findByStudentEmail(String studentEmail);

}

