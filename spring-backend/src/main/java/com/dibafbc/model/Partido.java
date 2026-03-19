package com.dibafbc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "partidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora")
    private String hora;

    @Column(name = "equipolocal")
    private String equipoLocal;

    @Column(name = "equipovisitante")
    private String equipoVisitante;

    @Column(name = "resultado")
    private String resultado;

    @Column(name = "Cancha")
    private String cancha;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "uniforme")
    private String uniforme;

    @Column(name = "valor")
    private String valor;

    @Column(name = "observaciones")
    private String observaciones;

    @Column(name = "escudo_local")
    private String escudoLocal;

    @Column(name = "escudo_visitante")
    private String escudoVisitante;

    @Column(name = "escudo")
    private String escudo;

    public boolean tieneResultado() {
        return resultado != null && !resultado.isBlank() && !resultado.equals("-");
    }

    public boolean esHoy() {
        return LocalDate.now().equals(this.fecha);
    }

    public String getEstado() {
        if (tieneResultado()) return "FINALIZADO";
        if (esHoy())         return "EN_VIVO";
        return "PROXIMO";
    }
}
