package com.dibafbc.repository;

import com.dibafbc.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, UUID> {

    List<Partido> findByFechaGreaterThanEqualOrderByFechaAsc(LocalDate fecha);

    List<Partido> findByFecha(LocalDate fecha);

    List<Partido> findByEquipoLocalContainingIgnoreCaseOrEquipoVisitanteContainingIgnoreCase(String equipoLocal, String equipoVisitante);

    @Query("SELECT MIN(p.fecha) FROM Partido p WHERE p.fecha >= :hoy")
    LocalDate findProximaFecha(@Param("hoy") LocalDate hoy);
}
