package com.example.pos_tactil.service;

import com.example.pos_tactil.model.CajaSesion;
import com.example.pos_tactil.repository.CajaSesionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CajaSesionService {


    private final CajaSesionRepository cajaSesionRepository;

    public CajaSesionService(CajaSesionRepository cajaSesionRepository) {
        this.cajaSesionRepository = cajaSesionRepository;
    }

    public CajaSesion abrirCaja() {
        // Verificamos si ya hay una caja abierta
        Optional<CajaSesion> cajaAbierta = cajaSesionRepository.findByEstado(CajaSesion.EstadoCaja.ABIERTA);
        if (cajaAbierta.isPresent()) {
            throw new IllegalStateException("Ya hay una caja abierta.");
        }

        CajaSesion nuevaSesion = CajaSesion.builder()
                .fechaApertura(LocalDateTime.now())
                .estado(CajaSesion.EstadoCaja.ABIERTA)
                .totalVentas(BigDecimal.ZERO)
                .build();

        return cajaSesionRepository.save(nuevaSesion);
    }

    public CajaSesion cerrarCaja(BigDecimal totalVentas) {
        CajaSesion cajaAbierta = cajaSesionRepository.findByEstado(CajaSesion.EstadoCaja.ABIERTA)
                .orElseThrow(() -> new IllegalStateException("No hay una caja abierta."));

        cajaAbierta.setFechaCierre(LocalDateTime.now());
        cajaAbierta.setTotalVentas(totalVentas);
        cajaAbierta.setEstado(CajaSesion.EstadoCaja.CERRADA);

        return cajaSesionRepository.save(cajaAbierta);
    }

    public List<CajaSesion> obtenerTodasLasSesiones() {
        return cajaSesionRepository.findAll();
    }

    public Optional<CajaSesion> obtenerCajaAbierta() {
        return cajaSesionRepository.findByEstado(CajaSesion.EstadoCaja.ABIERTA);
    }

    public CajaSesion abrirNuevaCaja() {
        if (existeCajaAbierta()) {
            throw new IllegalStateException("No se puede abrir una nueva caja. Es posible que ya haya una abierta.");
        }

        // Si no hay caja abierta, entonces crear una nueva
        CajaSesion nuevaCaja = CajaSesion.builder()
                .fechaApertura(LocalDateTime.now())
                .estado(CajaSesion.EstadoCaja.ABIERTA)
                .totalVentas(BigDecimal.ZERO)
                .build();

        return cajaSesionRepository.save(nuevaCaja);
    }

    public boolean existeCajaAbierta() {
        return cajaSesionRepository.findByEstado(CajaSesion.EstadoCaja.ABIERTA).isPresent();
    }

    public void eliminarCaja(Long id) {
        cajaSesionRepository.deleteById(id);
    }
}

