package com.dibafbc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "jugadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JugadorGeneral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "status")
    private String status = "Activo";

    @Column(name = "fecha_registro", updatable = false)
    @CreationTimestamp
    private OffsetDateTime fechaRegistro;
}
