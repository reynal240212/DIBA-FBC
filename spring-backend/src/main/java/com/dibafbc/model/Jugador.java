package com.dibafbc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "identificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Jugador {

    @Id
    @Column(name = "numero")
    private String numero;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "apellidos")
    private String apellidos;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "nacionalidad")
    private String nacionalidad;

    @Column(name = "lugar_nacimiento")
    private String lugarNacimiento;

    @Column(name = "sexo")
    private String sexo;

    @Column(name = "grupo_sanguineo")
    private String grupoSanguineo;

    @Column(name = "fecha_expedicion")
    private LocalDate fechaExpedicion;

    @Column(name = "lugar_expedicion")
    private String lugarExpedicion;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "face_token")
    private String faceToken;
}
