package com.dibafbc.repository;

import com.dibafbc.model.PlayerDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlayerDocumentRepository extends JpaRepository<PlayerDocument, UUID> {
    List<PlayerDocument> findByIdentificacionNumero(String identificacionNumero);
    Optional<PlayerDocument> findByIdentificacionNumeroAndDocType(String identificacionNumero, String docType);
}
