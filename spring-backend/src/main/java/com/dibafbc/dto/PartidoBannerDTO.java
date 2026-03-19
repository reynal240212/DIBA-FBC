package com.dibafbc.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartidoBannerDTO {

    private Long id;
    private String fecha;
    private String hora;
    private String equipoLocal;
    private String equipoVisitante;
    private String resultado;
    private String cancha;
    private String categoria;
    private String escudoLocal;
    private String escudoVisitante;
    private String estado;

    private static final DateTimeFormatter FORMATTER =
        DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy", new Locale("es", "ES"));

    public static PartidoBannerDTO fromPartido(com.dibafbc.model.Partido p) {
        return PartidoBannerDTO.builder()
                .id(p.getId())
                .fecha(p.getFecha() != null ? p.getFecha().format(FORMATTER) : "")
                .hora(p.getHora())
                .equipoLocal(p.getEquipoLocal() != null ? p.getEquipoLocal() : "DIBA FBC")
                .equipoVisitante(p.getEquipoVisitante() != null ? p.getEquipoVisitante() : "Rival")
                .resultado(p.getResultado())
                .cancha(p.getCancha() != null ? p.getCancha() : "Cancha")
                .categoria(p.getCategoria() != null ? p.getCategoria().toUpperCase() : "GENERAL")
                .escudoLocal(resolveEscudo(p.getEscudoLocal() != null ? p.getEscudoLocal() : p.getEscudo(), p.getEquipoLocal()))
                .escudoVisitante(resolveEscudo(p.getEscudoVisitante(), p.getEquipoVisitante()))
                .estado(p.getEstado())
                .build();
    }

    private static String resolveEscudo(String url, String nombre) {
        if (nombre != null && nombre.toUpperCase().contains("DIBA")) {
            return "/images/ESCUDO.png";
        }
        if (url == null || url.isBlank()) {
            String encodedName = nombre != null ? nombre.replace(" ", "+") : "R";
            return "https://ui-avatars.com/api/?name=" + encodedName
                    + "&background=1e293b&color=cbd5e1&bold=true";
        }
        return "https://wsrv.nl/?url=" + url;
    }
}
