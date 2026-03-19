package com.dibafbc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "player_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "identificacion_numero", nullable = false)
    private String identificacionNumero;

    @Column(name = "doc_type", nullable = false)
    private String docType;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "status")
    private String status = "pendiente";

    @Column(name = "updated_at")
    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
