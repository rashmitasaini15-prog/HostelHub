
package com.hostelhub.service;

import com.hostelhub.model.Fee;
import com.hostelhub.repository.FeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeeService {

    private final FeeRepository feeRepository;

    public FeeService(FeeRepository feeRepository) {
        this.feeRepository = feeRepository;
    }

    public Fee addFee(Fee fee) {
        fee.setPendingAmount(fee.getTotalFee() - fee.getPaidAmount());

        if (fee.getPendingAmount() <= 0) {
            fee.setPendingAmount(0);
            fee.setStatus("Paid");
        } else {
            fee.setStatus("Pending");
        }

        return feeRepository.save(fee);
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public List<Fee> getStudentFees(String studentEmail) {
        return feeRepository.findByStudentEmail(studentEmail);
    }

    public Fee markFeeAsPaid(String id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Fee record not found")
                );

        fee.setPaidAmount(fee.getTotalFee());
        fee.setPendingAmount(0);
        fee.setStatus("Paid");

        return feeRepository.save(fee);
    }
}

