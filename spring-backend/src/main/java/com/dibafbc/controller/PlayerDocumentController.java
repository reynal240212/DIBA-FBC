package com.dibafbc.controller;

import com.dibafbc.model.PlayerDocument;
import com.dibafbc.service.PlayerDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player-documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlayerDocumentController {

    private final PlayerDocumentService service;

    @GetMapping
    public List<PlayerDocument> getAll() {
        return service.getAll();
    }

    @GetMapping("/{dni}")
    public List<PlayerDocument> getByPlayer(@PathVariable String dni) {
        return service.getByPlayer(dni);
    }

    @PostMapping("/upsert")
    public PlayerDocument upsert(@RequestBody PlayerDocument doc) {
        return service.saveOrUpdate(doc);
    }
}
