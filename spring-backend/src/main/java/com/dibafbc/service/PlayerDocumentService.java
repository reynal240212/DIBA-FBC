package com.dibafbc.service;

import com.dibafbc.model.PlayerDocument;
import com.dibafbc.repository.PlayerDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlayerDocumentService {

    private final PlayerDocumentRepository repository;

    public List<PlayerDocument> getAll() {
        return repository.findAll();
    }

    public List<PlayerDocument> getByPlayer(String dni) {
        return repository.findByIdentificacionNumero(dni);
    }

    public PlayerDocument saveOrUpdate(PlayerDocument doc) {
        Optional<PlayerDocument> existing = repository.findByIdentificacionNumeroAndDocType(
                doc.getIdentificacionNumero(), doc.getDocType());
        
        if (existing.isPresent()) {
            PlayerDocument update = existing.get();
            update.setFileUrl(doc.getFileUrl());
            update.setStatus(doc.getStatus());
            return repository.save(update);
        } else {
            return repository.save(doc);
        }
    }
}
