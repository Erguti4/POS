package com.example.pos_tactil.dto;

import lombok.Data;

import java.util.List;

@Data
public class FacturaDTO {
    private List<ProductoDTO> productos;
    private Double total;

    public List<ProductoDTO> getProductos() {
        return productos;
    }

    public void setProductos(List<ProductoDTO> productos) {
        this.productos = productos;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }
}

