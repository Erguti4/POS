package com.example.pos_tactil.controller;

import com.example.pos_tactil.dto.FacturaDTO;
import com.example.pos_tactil.model.Factura;
import com.example.pos_tactil.service.FacturaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/factura")
public class FacturaController {

    private final FacturaService facturaService;

    public FacturaController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @PostMapping("/guardar")
    public void guardarFactura(@RequestBody FacturaDTO facturaDTO) {
        facturaService.guardarFactura(facturaDTO);
    }

    @GetMapping
    public List<Factura> obtenerFacturas() {
        return facturaService.obtenerFacturas();
    }

    @GetMapping("/{idFactura}")
    public Factura obtenerFactura(@PathVariable Integer idFactura) {
        return facturaService.obtenerFactura(idFactura);
    }

    @DeleteMapping("/{idFactura}")
    public void eliminarFactura(@PathVariable Integer idFactura) {
        facturaService.eliminarFactura(idFactura);
    }

    // Nuevo endpoint para obtener el último ID de factura
    @GetMapping("/ultimo-id")
    public Map<String, Integer> obtenerUltimoIdFactura() {
        int ultimoId = Math.toIntExact(facturaService.obtenerUltimaFacturaId()); // Llamamos al servicio para obtener el último ID
        return Map.of("ultimoId", ultimoId); // Devolvemos un mapa con el último ID
    }
}
