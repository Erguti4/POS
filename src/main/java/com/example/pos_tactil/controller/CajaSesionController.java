package com.example.pos_tactil.controller;

import com.example.pos_tactil.model.CajaSesion;
import com.example.pos_tactil.service.CajaSesionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/caja")
@CrossOrigin // Habilita CORS por si accedes desde el frontend local
public class CajaSesionController {

    private final CajaSesionService cajaSesionService;

    public CajaSesionController(CajaSesionService cajaSesionService) {
        this.cajaSesionService = cajaSesionService;
    }

    // Abrir caja
    @PostMapping("/abrir")
    public ResponseEntity<CajaSesion> abrirCaja() {
        try {
            CajaSesion sesion = cajaSesionService.abrirNuevaCaja();
            return ResponseEntity.ok(sesion);
        } catch (IllegalStateException e) {
            // Si ya hay una caja abierta, respondemos con un error 400
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Cerrar caja
    @PostMapping("/cerrar")
    public ResponseEntity<CajaSesion> cerrarCaja(@RequestParam BigDecimal totalVentas) {
        try {
            CajaSesion sesionCerrada = cajaSesionService.cerrarCaja(totalVentas);
            return ResponseEntity.ok(sesionCerrada);
        } catch (IllegalStateException e) {
            // Si intentan cerrar una caja que no está abierta, respondemos con un error 400
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Obtener todas las sesiones de caja
    @GetMapping
    public ResponseEntity<List<CajaSesion>> obtenerTodasLasSesiones() {
        return ResponseEntity.ok(cajaSesionService.obtenerTodasLasSesiones());
    }

    // Obtener la caja abierta
    @GetMapping("/abierta")
    public ResponseEntity<CajaSesion> obtenerCajaAbierta() {
        Optional<CajaSesion> cajaAbierta = cajaSesionService.obtenerCajaAbierta();
        return cajaAbierta.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }
}
