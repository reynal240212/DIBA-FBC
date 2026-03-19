package com.dibafbc.controller;

import com.dibafbc.service.PartidoBannerService;
import com.dibafbc.service.PartidoBannerService.BannerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class PartidoBannerController {

    private final PartidoBannerService bannerService;

    @GetMapping("/banner")
    public ResponseEntity<BannerResponse> getBanner() {
        return ResponseEntity.ok(bannerService.getBannerData());
    }

    @GetMapping("/partidos")
    public ResponseEntity<?> getAllPartidos() {
        return ResponseEntity.ok(bannerService.getAllPartidos());
    }

    @GetMapping("/partidos/fecha")
    public ResponseEntity<?> getPartidosByFecha(@RequestParam("val") String fecha) {
        return ResponseEntity.ok(bannerService.getPartidosByFecha(LocalDate.parse(fecha)));
    }

    @GetMapping("/partidos/equipo")
    public ResponseEntity<?> getPartidosByEquipo(@RequestParam("val") String equipo) {
        return ResponseEntity.ok(bannerService.getPartidosByEquipo(equipo));
    }
}
