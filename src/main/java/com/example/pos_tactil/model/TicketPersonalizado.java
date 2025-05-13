package com.example.pos_tactil.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class TicketPersonalizado {

    @Column(nullable = false)
    private String logoUrl;

    @Column(nullable = false)
    private int fontSize;

    @Column(nullable = false)
    private String fontType;

    @Column(nullable = false)
    private boolean showDate;

    @Column(nullable = false)
    private String customText;

    @Id
    private Long id;

    // Constructor sin parámetros
    public TicketPersonalizado() {
        this.id = 1L; // El ID se establece en 1L de forma fija
    }

    // Getters y setters
    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public int getFontSize() {
        return fontSize;
    }

    public void setFontSize(int fontSize) {
        this.fontSize = fontSize;
    }

    public String getFontType() {
        return fontType;
    }

    public void setFontType(String fontType) {
        this.fontType = fontType;
    }

    public boolean isShowDate() {
        return showDate;
    }

    public void setShowDate(boolean showDate) {
        this.showDate = showDate;
    }

    public String getCustomText() {
        return customText;
    }

    public void setCustomText(String customText) {
        this.customText = customText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
