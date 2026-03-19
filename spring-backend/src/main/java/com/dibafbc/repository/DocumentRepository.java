package com.dibafbc.repository;

import com.dibafbc.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    List<Document> findAllByOrderByCreatedAtDesc();
}
