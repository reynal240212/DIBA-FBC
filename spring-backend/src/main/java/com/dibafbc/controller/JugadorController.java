package com.dibafbc.controller;

import com.dibafbc.dto.JugadorDTO;
import com.dibafbc.service.JugadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Para desarrollo local
public class JugadorController {

    private final JugadorService service;

    @GetMapping
    public List<JugadorDTO> getAllPlayers(@RequestParam(required = false) String categoria) {
        if (categoria != null && !categoria.isBlank()) {
            return service.getPlayersByCategory(categoria);
        }
        return service.getAllPlayers();
    }

    @GetMapping("/{numero}")
    public JugadorDTO getPlayer(@PathVariable String numero) {
        return service.getPlayerByDocument(numero);
    }

    @PostMapping
    public JugadorDTO createPlayer(@RequestBody JugadorDTO dto) {
        return service.createPlayer(dto);
    }

    @PutMapping("/{numero}")
    public JugadorDTO updatePlayer(@PathVariable String numero, @RequestBody JugadorDTO dto) {
        return service.updatePlayer(numero, dto);
    }

    @DeleteMapping("/{numero}")
    public void deletePlayer(@PathVariable String numero) {
        service.deletePlayer(numero);
    }
}
