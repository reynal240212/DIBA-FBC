package com.dibafbc.service;

import com.dibafbc.model.Planilla;
import com.dibafbc.model.PlanillaRegistro;
import com.dibafbc.repository.PlanillaRepository;
import com.dibafbc.repository.PlanillaRegistroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlanillaService {

    private final PlanillaRepository repository;
    private final PlanillaRegistroRepository registroRepository;

    public Planilla getOrCreateByDate(LocalDate fecha) {
        return repository.findByFecha(fecha)
                .orElseGet(() -> {
                    Planilla newP = new Planilla();
                    newP.setFecha(fecha);
                    newP.setCategoria("General");
                    newP.setCreadaEn(OffsetDateTime.now());
                    return repository.save(newP);
                });
    }

    public List<PlanillaRegistro> getRegistrosByPlanilla(Integer planillaId) {
        return registroRepository.findByPlanillaId(planillaId);
    }

    @Transactional
    public PlanillaRegistro saveOrUpdateRegistro(PlanillaRegistro registro) {
        Optional<PlanillaRegistro> existing = registroRepository.findByPlanillaIdAndJugadorDni(
                registro.getPlanillaId(), registro.getJugadorDni());
        
        if (existing.isPresent()) {
            PlanillaRegistro update = existing.get();
            update.setPago(registro.getPago());
            update.setAsistencia(registro.getAsistencia());
            update.setObservacion(registro.getObservacion());
            return registroRepository.save(update);
        } else {
            return registroRepository.save(registro);
        }
    }
}
