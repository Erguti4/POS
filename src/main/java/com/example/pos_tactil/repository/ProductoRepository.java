package com.example.pos_tactil.repository;

import com.example.pos_tactil.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, String> {
    // Puedes agregar métodos personalizados aquí si es necesario
}
