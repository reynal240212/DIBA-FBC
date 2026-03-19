package com.dibafbc.service;

import com.dibafbc.dto.JugadorDTO;
import com.dibafbc.model.Jugador;
import com.dibafbc.model.JugadorGeneral;
import com.dibafbc.repository.JugadorGeneralRepository;
import com.dibafbc.repository.JugadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JugadorService {

    private final JugadorRepository repository;
    private final JugadorGeneralRepository generalRepository;

    public List<JugadorDTO> getAllPlayers() {
        return repository.findAllByOrderByApellidosAsc().stream()
                .map(JugadorDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<JugadorDTO> getPlayersByCategory(String category) {
        return repository.findByCategoria(category).stream()
                .map(JugadorDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public JugadorDTO getPlayerByDocument(String numero) {
        return repository.findById(numero)
                .map(JugadorDTO::fromEntity)
                .orElse(null);
    }

    @Transactional
    public JugadorDTO createPlayer(JugadorDTO dto) {
        Jugador jugador = dto.toEntity();
        repository.save(jugador);

        // Sync with JugadorGeneral (legacy table)
        JugadorGeneral general = new JugadorGeneral();
        general.setNombre(dto.getNombre() + " " + dto.getApellidos());
        general.setCategoria(dto.getCategoria());
        general.setStatus("Activo");
        generalRepository.save(general);

        return JugadorDTO.fromEntity(jugador);
    }

    @Transactional
    public JugadorDTO updatePlayer(String numero, JugadorDTO dto) {
        return repository.findById(numero)
                .map(jugador -> {
                    String oldFullName = jugador.getNombre() + " " + jugador.getApellidos();
                    dto.updateEntity(jugador);
                    repository.save(jugador);

                    // Update JugadorGeneral if possible
                    generalRepository.findByNombre(oldFullName).ifPresent(gen -> {
                        gen.setNombre(jugador.getNombre() + " " + jugador.getApellidos());
                        gen.setCategoria(jugador.getCategoria());
                        generalRepository.save(gen);
                    });

                    return JugadorDTO.fromEntity(jugador);
                })
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
    }

    @Transactional
    public void deletePlayer(String numero) {
        repository.findById(numero).ifPresent(jugador -> {
            String fullName = jugador.getNombre() + " " + jugador.getApellidos();
            repository.delete(jugador);
            generalRepository.findByNombre(fullName).ifPresent(generalRepository::delete);
        });
    }
}
