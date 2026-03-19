package com.dibafbc.service;

import com.dibafbc.dto.PartidoBannerDTO;
import com.dibafbc.model.Partido;
import com.dibafbc.repository.PartidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartidoBannerService {

    private final PartidoRepository repository;

    public BannerResponse getBannerData() {
        LocalDate hoy = LocalDate.now();

        List<Partido> partidosHoy = repository.findByFecha(hoy);

        if (!partidosHoy.isEmpty()) {
            return new BannerResponse(toDto(partidosHoy), false, null);
        }

        LocalDate proximaFecha = repository.findProximaFecha(hoy);

        if (proximaFecha == null) {
            return new BannerResponse(Collections.emptyList(), false, null);
        }

        List<Partido> proximosPartidos = repository.findByFecha(proximaFecha);
        return new BannerResponse(toDto(proximosPartidos), true, proximaFecha.toString());
    }

    public List<PartidoBannerDTO> getPartidosByFecha(LocalDate fecha) {
        return toDto(repository.findByFecha(fecha));
    }

    public List<PartidoBannerDTO> getPartidosByEquipo(String equipo) {
        return toDto(repository.findByEquipoLocalContainingIgnoreCaseOrEquipoVisitanteContainingIgnoreCase(equipo, equipo));
    }

    public List<PartidoBannerDTO> getAllPartidos() {
        return toDto(repository.findAll());
    }

    private List<PartidoBannerDTO> toDto(List<Partido> partidos) {
        return partidos.stream()
                .map(PartidoBannerDTO::fromPartido)
                .collect(Collectors.toList());
    }

    public record BannerResponse(
        List<PartidoBannerDTO> partidos,
        boolean esFuturo,
        String proximaFechaLabel
    ) {}
}
