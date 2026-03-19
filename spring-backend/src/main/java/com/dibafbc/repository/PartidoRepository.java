package com.dibafbc.repository;

import com.dibafbc.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {

    List<Partido> findByFechaGreaterThanEqualOrderByFechaAsc(LocalDate fecha);

    List<Partido> findByFecha(LocalDate fecha);

    List<Partido> findByEquipoLocalContainingIgnoreCaseOrEquipoVisitanteContainingIgnoreCase(String equipoLocal, String equipoVisitante);

    @Query("SELECT MIN(p.fecha) FROM Partido p WHERE p.fecha >= :hoy")
    LocalDate findProximaFecha(@Param("hoy") LocalDate hoy);
}
