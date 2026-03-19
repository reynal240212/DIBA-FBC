package com.dibafbc.service;

import com.dibafbc.model.Partido;
import com.dibafbc.repository.PartidoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PartidoService {

    private final PartidoRepository repository;

    public PartidoService(PartidoRepository repository) {
        this.repository = repository;
    }

    public List<Partido> getAll() {
        return repository.findAll();
    }

    public Optional<Partido> getById(Long id) {
        return repository.findById(id);
    }

    public Partido save(Partido partido) {
        return repository.save(partido);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
