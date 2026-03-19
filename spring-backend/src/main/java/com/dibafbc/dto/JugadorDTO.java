package com.dibafbc.dto;

import com.dibafbc.model.Jugador;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JugadorDTO {
    private String numero;
    private String nombre;
    private String apellidos;
    private LocalDate fechaNacimiento;
    private String nacionalidad;
    private String lugarNacimiento;
    private String sexo;
    private String grupoSanguineo;
    private LocalDate fechaExpedicion;
    private String lugarExpedicion;
    private LocalDate fechaVencimiento;
    private String categoria;
    private String fotoUrl;

    public void updateEntity(Jugador jugador) {
        jugador.setNombre(this.nombre);
        jugador.setApellidos(this.apellidos);
        jugador.setFechaNacimiento(this.fechaNacimiento);
        jugador.setNacionalidad(this.nacionalidad);
        jugador.setLugarNacimiento(this.lugarNacimiento);
        jugador.setSexo(this.sexo);
        jugador.setGrupoSanguineo(this.grupoSanguineo);
        jugador.setFechaExpedicion(this.fechaExpedicion);
        jugador.setLugarExpedicion(this.lugarExpedicion);
        jugador.setFechaVencimiento(this.fechaVencimiento);
        jugador.setCategoria(this.categoria);
        jugador.setFotoUrl(this.fotoUrl);
    }

    public Jugador toEntity() {
        Jugador j = new Jugador();
        j.setNumero(this.numero);
        updateEntity(j);
        return j;
    }

    public static JugadorDTO fromEntity(Jugador jugador) {
        return new JugadorDTO(
            jugador.getNumero(),
            jugador.getNombre(),
            jugador.getApellidos(),
            jugador.getFechaNacimiento(),
            jugador.getNacionalidad(),
            jugador.getLugarNacimiento(),
            jugador.getSexo(),
            jugador.getGrupoSanguineo(),
            jugador.getFechaExpedicion(),
            jugador.getLugarExpedicion(),
            jugador.getFechaVencimiento(),
            jugador.getCategoria(),
            jugador.getFotoUrl()
        );
    }
}
