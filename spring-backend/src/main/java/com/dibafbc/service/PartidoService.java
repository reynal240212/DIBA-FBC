package com.dibafbc.service;

import com.dibafbc.model.Partido;
import com.dibafbc.repository.PartidoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PartidoService {

    private final PartidoRepository repository;

    public PartidoService(PartidoRepository repository) {
        this.repository = repository;
    }

    public List<Partido> getAll() {
        return repository.findAll();
    }

    public Optional<Partido> getById(UUID id) {
        return repository.findById(id);
    }

    public Partido save(Partido partido) {
        return repository.save(partido);
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
