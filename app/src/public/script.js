// --- script.js (FRONTEND CORREGIDO PARA APIM) ---

async function cargarTickets() {
    try {
        // Usamos './' para que funcione bajo el sufijo /v1/ del APIM
        const respuesta = await fetch('./api/tickets');
        const tickets = await respuesta.json();
        
        const tablaBody = document.getElementById('ticketsTableBody');
        tablaBody.innerHTML = ''; 

        tickets.forEach(ticket => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.usuario}</td>
                <td>${ticket.titulo}</td>
                <td><span class="badge ${getPrioridadClass(ticket.prioridad)}">${ticket.prioridad}</span></td>
                <td><span class="badge bg-secondary">${ticket.estado}</span></td>
            `;
            tablaBody.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al obtener tickets:', error);
    }
}

function getPrioridadClass(prioridad) {
    switch(prioridad) {
        case 'Crítica': return 'bg-danger';
        case 'Alta': return 'bg-warning text-dark';
        case 'Baja': return 'bg-info text-dark';
        default: return 'bg-primary';
    }
}

async function crearTicket(event) {
    event.preventDefault();

    const datos = {
        usuario: document.getElementById('usuario').value,
        titulo: document.getElementById('titulo').value,
        prioridad: document.getElementById('prioridad').value,
        descripcion: "Generado desde Web Lab 21"
    };

    try {
        const respuesta = await fetch('./api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            document.getElementById('ticketForm').reset();
            cargarTickets(); 
        }
    } catch (error) {
        console.error('Error al crear ticket:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarTickets();
    document.getElementById('ticketForm').addEventListener('submit', crearTicket);
});