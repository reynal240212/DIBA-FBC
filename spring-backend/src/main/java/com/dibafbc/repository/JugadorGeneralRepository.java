package com.dibafbc.repository;

import com.dibafbc.model.JugadorGeneral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JugadorGeneralRepository extends JpaRepository<JugadorGeneral, Integer> {
    Optional<JugadorGeneral> findByNombre(String nombre);
}
