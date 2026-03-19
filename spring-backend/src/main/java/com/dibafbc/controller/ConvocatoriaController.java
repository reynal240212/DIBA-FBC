package com.dibafbc.controller;

import com.dibafbc.model.Convocatoria;
import com.dibafbc.service.ConvocatoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/convocatorias")
@CrossOrigin(origins = "*")
public class ConvocatoriaController {

    private final ConvocatoriaService service;

    public ConvocatoriaController(ConvocatoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Convocatoria> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Convocatoria> getById(@PathVariable UUID id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Convocatoria create(@RequestBody Convocatoria convocatoria) {
        return service.save(convocatoria);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
