package com.example.pos_tactil.service;

import com.example.pos_tactil.model.Producto;
import com.example.pos_tactil.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {


    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // Guardar o actualizar un producto
    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    // Buscar producto por código de barras
    public Optional<Producto> obtenerProductoPorCodigoBarra(String codigoBarra) {
        return productoRepository.findById(codigoBarra);
    }

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    // Otros métodos si es necesario...
}
