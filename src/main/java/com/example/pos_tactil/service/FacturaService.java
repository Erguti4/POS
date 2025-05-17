package com.example.pos_tactil.service;

import com.example.pos_tactil.dto.FacturaDTO;
import com.example.pos_tactil.dto.ProductoDTO;
import com.example.pos_tactil.model.Factura;
import com.example.pos_tactil.model.ProductoFactura;
import com.example.pos_tactil.repository.FacturaRepository;
import com.example.pos_tactil.repository.ProductoFacturaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FacturaService {

    @PersistenceContext
    private EntityManager entityManager;  // Inyecta el EntityManager

    private final FacturaRepository facturaRepository;
    private final ProductoFacturaRepository productoFacturaRepository;

    public FacturaService(FacturaRepository facturaRepository, ProductoFacturaRepository productoFacturaRepository) {
        this.facturaRepository = facturaRepository;
        this.productoFacturaRepository = productoFacturaRepository;
    }

    @Transactional
    public void guardarFactura(FacturaDTO facturaDTO) {
        // Crear una nueva factura
        Factura factura = new Factura();
        factura.setFecha(LocalDateTime.now());
        factura.setTotal(facturaDTO.getTotal());

        // Guardar la factura
        factura = facturaRepository.save(factura);

        // Limpiar la sesión para evitar el conflicto
        entityManager.flush(); // Forzar la escritura de los cambios y limpiar la sesión

        // Crear y guardar los productos de la factura
        List<ProductoDTO> productos = facturaDTO.getProductos();
        for (ProductoDTO productoDTO : productos) {
            ProductoFactura productoFactura = new ProductoFactura();
            productoFactura.setNombre(productoDTO.getNombre());
            productoFactura.setPrecio(productoDTO.getPrecio());
            productoFactura.setCantidad(productoDTO.getCantidad());
            productoFactura.setDescuento(productoDTO.getDescuento());
            productoFactura.setFactura(factura); // Relacionar con la factura

            productoFacturaRepository.save(productoFactura);
        }
    }


    public List<Factura> obtenerFacturas() {
        return facturaRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public Long obtenerUltimaFacturaId() {
        List<Long> ids = facturaRepository.obtenerUltimaFacturaId();
        return ids.isEmpty() ? null : ids.get(0); // Obtener el primer (y más grande) id
    }

}
