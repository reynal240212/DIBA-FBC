package com.dibafbc.repository;

import com.dibafbc.model.Jugador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JugadorRepository extends JpaRepository<Jugador, String> {
    List<Jugador> findByCategoria(String categoria);
    List<Jugador> findAllByOrderByApellidosAsc();
}
