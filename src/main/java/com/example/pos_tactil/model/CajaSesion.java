package com.example.pos_tactil.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@Entity
@Data
public class CajaSesion {

    @Id
    private Long id;

    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private BigDecimal totalVentas;

    @Enumerated(EnumType.STRING)
    private EstadoCaja estado;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = generarNuevoId(); // Asignamos el ID manualmente antes de persistir
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getFechaApertura() {
        return fechaApertura;
    }

    public void setFechaApertura(LocalDateTime fechaApertura) {
        this.fechaApertura = fechaApertura;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public BigDecimal getTotalVentas() {
        return totalVentas;
    }

    public void setTotalVentas(BigDecimal totalVentas) {
        this.totalVentas = totalVentas;
    }

    public EstadoCaja getEstado() {
        return estado;
    }

    public void setEstado(EstadoCaja estado) {
        this.estado = estado;
    }

    private Long generarNuevoId() {
        // Este método maneja la asignación manual del ID.
        String sql = "SELECT MAX(id) FROM caja_sesion"; // Obtiene el ID máximo actual
        try (Connection conn = DriverManager.getConnection("jdbc:sqlite:pos_tactil.db");
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getLong(1) + 1; // Devuelve el siguiente ID
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 1L; // Si no hay ningún ID, empieza desde 1
    }

    public enum EstadoCaja {
        ABIERTA,
        CERRADA
    }

    public CajaSesion() {
    }

    public CajaSesion(Builder builder) {
        this.id = builder.id;
        this.fechaApertura = builder.fechaApertura;
        this.fechaCierre = builder.fechaCierre;
        this.estado = builder.estado;
        this.totalVentas = builder.totalVentas;
    }

    // Métodos getter y setter

    public static class Builder {
        private Long id;
        private LocalDateTime fechaApertura;
        private LocalDateTime fechaCierre;
        private EstadoCaja estado;
        private BigDecimal totalVentas;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder fechaApertura(LocalDateTime fechaApertura) {
            this.fechaApertura = fechaApertura;
            return this;
        }

        public Builder fechaCierre(LocalDateTime fechaCierre) {
            this.fechaCierre = fechaCierre;
            return this;
        }

        public Builder estado(EstadoCaja estado) {
            this.estado = estado;
            return this;
        }

        public Builder totalVentas(BigDecimal totalVentas) {
            this.totalVentas = totalVentas;
            return this;
        }

        public CajaSesion build() {
            return new CajaSesion(this);
        }
    }

    // Método estático para invocar el builder
    public static Builder builder() {
        return new Builder();
    }
}
