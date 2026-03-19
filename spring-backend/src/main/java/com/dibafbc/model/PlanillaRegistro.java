package com.dibafbc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "planilla_registros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanillaRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "planilla_id", nullable = false)
    private Integer planillaId;

    @Column(name = "jugador_id")
    private Integer jugadorId;

    @Column(name = "jugador_dni", nullable = false)
    private String jugadorDni;

    @Column(name = "pago")
    private BigDecimal pago;

    @Column(name = "asistencia")
    private String asistencia;

    @Column(name = "observacion")
    private String observacion;
}
