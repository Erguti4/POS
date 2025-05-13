package com.example.pos_tactil.controller;

import com.example.pos_tactil.model.TicketPersonalizado;
import com.example.pos_tactil.service.TicketPersonalizadoService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ticket-personalizado")
public class TicketPersonalizadoController {


    private final TicketPersonalizadoService ticketPersonalizadoService;

    public TicketPersonalizadoController(TicketPersonalizadoService ticketPersonalizadoService) {
        this.ticketPersonalizadoService = ticketPersonalizadoService;
    }

    // Endpoint para obtener la personalización actual del ticket
    @GetMapping
    public TicketPersonalizado getTicketPersonalizado() {
        return ticketPersonalizadoService.getOrCreateTicketPersonalizado();
    }

    // Endpoint para actualizar la personalización del ticket
    @PutMapping
    public TicketPersonalizado updateTicketPersonalizado(@RequestBody TicketPersonalizado nuevoTicket) {
        return ticketPersonalizadoService.updateTicketPersonalizado(nuevoTicket);
    }
}
