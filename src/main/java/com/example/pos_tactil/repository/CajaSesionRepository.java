package com.example.pos_tactil.repository;

import com.example.pos_tactil.model.CajaSesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CajaSesionRepository extends JpaRepository<CajaSesion, Long> {
    Optional<CajaSesion> findByEstado(CajaSesion.EstadoCaja estado);
}
