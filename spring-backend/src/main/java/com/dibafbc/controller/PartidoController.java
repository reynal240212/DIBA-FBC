package com.dibafbc.controller;

import com.dibafbc.model.Partido;
import com.dibafbc.service.PartidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
public class PartidoController {

    private final PartidoService service;

    public PartidoController(PartidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Partido> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partido> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Partido create(@RequestBody Partido partido) {
        return service.save(partido);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partido> update(@PathVariable Long id, @RequestBody Partido partido) {
        return service.getById(id)
                .map(existing -> {
                    partido.setId(id);
                    return ResponseEntity.ok(service.save(partido));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
