package com.ecopassport.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonIgnoreProperties(ignoreUnknown = true)
public class LifecycleEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    Product product;

    String eventType, location, description;
    LocalDate eventDate;

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public void setProduct(Product p) { product = p; }
    public String getEventType() { return eventType; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate d) { eventDate = d; }
}
