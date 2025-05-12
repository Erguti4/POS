package com.example.pos_tactil.controller;

import com.example.pos_tactil.model.Producto;
import com.example.pos_tactil.service.ProductoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // Obtener todos los productos
    @GetMapping
    public List<Producto> obtenerProductos() {
        return productoService.findAll();
    }

    // Obtener un producto por código de barras
    @GetMapping("/{codigoBarra}")
    public Producto obtenerProducto(@PathVariable String codigoBarra) {
        Optional<Producto> producto = productoService.obtenerProductoPorCodigoBarra(codigoBarra);
        return producto.orElse(null); // Si no se encuentra el producto, retorna null
    }

    // Crear o actualizar un producto
    @PostMapping
    public Producto agregarProducto(@RequestBody Producto producto) {
        if (producto.getCodigoBarra() == null || producto.getCodigoBarra().isBlank() || producto.getCodigoBarra().isEmpty()) {
            throw new IllegalArgumentException("El código de barras es obligatorio.");
        }
        return productoService.guardarProducto(producto);
    }
}
