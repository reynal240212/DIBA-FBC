package com.dibafbc.service;

import com.dibafbc.model.Convocatoria;
import com.dibafbc.model.ConvocatoriaJugador;
import com.dibafbc.repository.ConvocatoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ConvocatoriaService {

    private final ConvocatoriaRepository repository;

    public ConvocatoriaService(ConvocatoriaRepository repository) {
        this.repository = repository;
    }

    public List<Convocatoria> getAll() {
        return repository.findAll();
    }

    public Optional<Convocatoria> getById(UUID id) {
        return repository.findById(id);
    }

    @Transactional
    public Convocatoria save(Convocatoria convocatoria) {
        if (convocatoria.getJugadores() != null) {
            for (ConvocatoriaJugador cj : convocatoria.getJugadores()) {
                cj.setConvocatoria(convocatoria);
                if (cj.getConvocatoriaId() == null && convocatoria.getId() != null) {
                    cj.setConvocatoriaId(convocatoria.getId());
                }
            }
        }
        Convocatoria saved = repository.save(convocatoria);
        
        // After save, handle IDs if they were null
        if (saved.getJugadores() != null) {
            for (ConvocatoriaJugador cj : saved.getJugadores()) {
                cj.setConvocatoriaId(saved.getId());
            }
            repository.save(saved); // Re-save to persist junction IDs
        }
        
        return saved;
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
