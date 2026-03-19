package com.dibafbc.controller;

import com.dibafbc.model.Document;
import com.dibafbc.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService service;

    @GetMapping
    public List<Document> getDocuments(@RequestParam(required = false) Integer ownerId) {
        if (ownerId != null) {
            return service.getDocumentsByOwner(ownerId);
        }
        return service.getAllDocuments();
    }

    @PostMapping("/metadata")
    public Document saveMetadata(@RequestBody Document document) {
        return service.saveDocumentMetadata(document);
    }
}
