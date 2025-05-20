package com.example.pos_tactil.repository;

import com.example.pos_tactil.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
    @Query("SELECT f.id FROM Factura f ORDER BY f.id DESC")
    List<Long> obtenerUltimaFacturaId();

}
