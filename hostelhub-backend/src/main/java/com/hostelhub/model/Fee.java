
package com.hostelhub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "fees")
public class Fee {

    @Id
    private String id;

    private String studentEmail;
    private String roomNumber;
    private double totalFee;
    private double paidAmount;
    private double pendingAmount;
    private String dueDate;
    private String status;

    public Fee() {
    }

    public Fee(String studentEmail, String roomNumber,
               double totalFee, double paidAmount,
               double pendingAmount, String dueDate, String status) {

        this.studentEmail = studentEmail;
        this.roomNumber = roomNumber;
        this.totalFee = totalFee;
        this.paidAmount = paidAmount;
        this.pendingAmount = pendingAmount;
        this.dueDate = dueDate;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public double getTotalFee() {
        return totalFee;
    }

    public double getPaidAmount() {
        return paidAmount;
    }

    public double getPendingAmount() {
        return pendingAmount;
    }

    public String getDueDate() {
        return dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public void setTotalFee(double totalFee) {
        this.totalFee = totalFee;
    }

    public void setPaidAmount(double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public void setPendingAmount(double pendingAmount) {
        this.pendingAmount = pendingAmount;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

