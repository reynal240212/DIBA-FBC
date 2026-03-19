package com.dibafbc.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "convocatoria_jugadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ConvocatoriaJugadorId.class)
public class ConvocatoriaJugador {

    @Id
    @Column(name = "convocatoria_id")
    private UUID convocatoriaId;

    @Id
    @Column(name = "identificacion_numero")
    private String identificacionNumero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convocatoria_id", insertable = false, updatable = false)
    @JsonIgnore
    private Convocatoria convocatoria;

    @Column(name = "nombre_jugador")
    private String nombreJugador;

    private String categoria;

    private String estado = "convocado";
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class ConvocatoriaJugadorId implements Serializable {
    private UUID convocatoriaId;
    private String identificacionNumero;
}
