package com.example.pos_tactil.service;


import com.example.pos_tactil.model.TicketPersonalizado;
import com.example.pos_tactil.repository.TicketPersonalizadoRepository;
import org.springframework.stereotype.Service;

@Service
public class TicketPersonalizadoService {


    private final TicketPersonalizadoRepository ticketPersonalizadoRepository;

    public TicketPersonalizadoService(TicketPersonalizadoRepository ticketPersonalizadoRepository) {
        this.ticketPersonalizadoRepository = ticketPersonalizadoRepository;
    }

    public TicketPersonalizado getOrCreateTicketPersonalizado() {
        // Buscamos el ticket personalizado con el ID 1
        return ticketPersonalizadoRepository.findById(1L).orElseGet(() -> {
            // Si no existe, creamos uno nuevo con ID 1
            TicketPersonalizado ticket = new TicketPersonalizado();
            ticket.setLogoUrl("defaultLogo.png");
            ticket.setFontSize(12);
            ticket.setFontType("Courier");
            ticket.setShowDate(true);
            ticket.setCustomText("Gracias por su compra.");
            return ticketPersonalizadoRepository.save(ticket);
        });
    }

    public TicketPersonalizado updateTicketPersonalizado(TicketPersonalizado nuevoTicket) {
        // Aseguramos que siempre se sobrescriba el ticket con ID 1
        nuevoTicket.setId(1L);
        return ticketPersonalizadoRepository.save(nuevoTicket);
    }
}

