package com.dibafbc.service;

import com.dibafbc.dto.DashboardDTO;
import com.dibafbc.repository.JugadorRepository;
import com.dibafbc.repository.PartidoRepository;
import com.dibafbc.repository.PlanillaRegistroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final JugadorRepository jugadorRepository;
    private final PartidoRepository partidoRepository;
    private final PlanillaRegistroRepository planillaRegistroRepository;

    public DashboardDTO getStats() {
        long players = jugadorRepository.count();
        long matches = partidoRepository.count();
        long pending = planillaRegistroRepository.countPendingPayments();
        
        // Asistencia simulada o calculada (en una versión real usaríamos una query agregada de asistencias)
        String attendance = "85%"; 

        return new DashboardDTO(
            players,
            matches,
            attendance,
            pending > 0 ? String.valueOf(pending) : "✓"
        );
    }
}
