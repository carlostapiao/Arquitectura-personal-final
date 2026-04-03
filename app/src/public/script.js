// --- script.js (FRONTEND) ---

// 1. Función para cargar los tickets al abrir la página
async function cargarTickets() {
    try {
        const respuesta = await fetch('./api/tickets');
        const tickets = await respuesta.json();
        
        const tablaBody = document.querySelector('tbody'); // O el ID de tu tabla
        tablaBody.innerHTML = ''; // Limpiamos la tabla antes de llenar

        tickets.forEach(ticket => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.usuario}</td>
                <td>${ticket.titulo}</td>
                <td>${ticket.prioridad}</td>
                <td><span class="badge ${ticket.estado === 'Abierto' ? 'bg-success' : 'bg-secondary'}">${ticket.estado}</span></td>
            `;
            tablaBody.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al obtener tickets:', error);
    }
}

// 2. Función para crear un nuevo ticket
async function crearTicket(event) {
    event.preventDefault(); // Evita que la página se recargue

    const usuario = document.getElementById('usuario').value;
    const titulo = document.getElementById('titulo').value; // El input del HTML
    const prioridad = document.getElementById('prioridad').value;

    const nuevoTicket = {
        usuario: usuario,
        titulo: titulo,
        prioridad: prioridad,
        descripcion: "Ticket generado desde la web Lab 21"
    };

    try {
        const respuesta = await fetch('/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoTicket)
        });

        if (respuesta.ok) {
            alert('¡Ticket creado con éxito!');
            document.querySelector('form').reset(); // Limpia el formulario
            cargarTickets(); // Recarga la tabla para ver el nuevo ticket
        } else {
            const errorData = await respuesta.json();
            alert('Error: ' + errorData.error);
        }
    } catch (error) {
        console.error('Error al enviar ticket:', error);
    }
}

// 3. Event Listeners (Para que todo funcione al cargar)
document.addEventListener('DOMContentLoaded', () => {
    cargarTickets(); // Carga inicial de datos

    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.addEventListener('submit', crearTicket);
    }
});