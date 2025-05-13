package com.example.pos_tactil.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

import java.util.Objects;

@Entity
@Data
public class Producto {


    @Id
    @Column(name = "codigo_barra", unique = true, nullable = false)
    private String codigoBarra; // Código de barras o identificador único

    private String nombre;
    private Double precio;

    public void setCodigoBarra(String codigoBarra) {
        this.codigoBarra = codigoBarra;
    }

    public String getNombre() {
        return nombre;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Producto producto = (Producto) o;
        return Objects.equals(codigoBarra, producto.codigoBarra);
    }

    @Override
    public int hashCode() {
        return Objects.hash(codigoBarra, nombre, precio);
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public String getCodigoBarra() {
        return codigoBarra;
    }
}
