package com.dibafbc.repository;

import com.dibafbc.model.Convocatoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ConvocatoriaRepository extends JpaRepository<Convocatoria, UUID> {
}
