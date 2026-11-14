
package com.hostelhub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;

    private String studentEmail;
    private String category;
    private String description;
    private String status;

    public Complaint() {
    }

    public Complaint(String studentEmail, String category,
                     String description, String status) {
        this.studentEmail = studentEmail;
        this.category = category;
        this.description = description;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
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

    public void setCategory(String category) {
        this.category = category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

