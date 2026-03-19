package com.dibafbc.controller;

import com.dibafbc.model.Planilla;
import com.dibafbc.model.PlanillaRegistro;
import com.dibafbc.service.PlanillaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/planillas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlanillaController {

    private final PlanillaService service;

    @GetMapping("/by-date")
    public Planilla getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return service.getOrCreateByDate(fecha);
    }

    @GetMapping("/{id}/registros")
    public List<PlanillaRegistro> getRegistros(@PathVariable Integer id) {
        return service.getRegistrosByPlanilla(id);
    }

    @PostMapping("/registros")
    public PlanillaRegistro saveRegistro(@RequestBody PlanillaRegistro registro) {
        return service.saveOrUpdateRegistro(registro);
    }
}
