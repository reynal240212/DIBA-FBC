package com.dibafbc.repository;

import com.dibafbc.model.PlanillaRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanillaRegistroRepository extends JpaRepository<PlanillaRegistro, Integer> {
    
    List<PlanillaRegistro> findByPlanillaId(Integer planillaId);
    
    Optional<PlanillaRegistro> findByPlanillaIdAndJugadorDni(Integer planillaId, String jugadorDni);

    @Query("SELECT COUNT(r) FROM PlanillaRegistro r WHERE r.pago IS NULL OR r.pago = 0")
    long countPendingPayments();
}
