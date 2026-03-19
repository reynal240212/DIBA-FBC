package com.dibafbc.repository;

import com.dibafbc.model.Planilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PlanillaRepository extends JpaRepository<Planilla, Integer> {
    Optional<Planilla> findByFecha(LocalDate fecha);
}
