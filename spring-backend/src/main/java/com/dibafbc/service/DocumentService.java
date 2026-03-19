package com.dibafbc.service;

import com.dibafbc.model.Document;
import com.dibafbc.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository repository;

    public List<Document> getAllDocuments() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<Document> getDocumentsByOwner(Integer ownerId) {
        return repository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    public Document saveDocumentMetadata(Document document) {
        return repository.save(document);
    }
}
