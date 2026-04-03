document.addEventListener('DOMContentLoaded', getTickets);

document.getElementById('formTicket').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        usuario: document.getElementById('usuario').value,
        titulo: document.getElementById('titulo').value,
        prioridad: document.getElementById('prioridad').value,
        descripcion: "Generado desde el portal de soporte"
    };

    await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    document.getElementById('formTicket').reset();
    getTickets();
});

async function getTickets() {
    const res = await fetch('/api/tickets');
    const tickets = await res.json();
    const tabla = document.getElementById('tablaTickets');
    tabla.innerHTML = '';

    tickets.forEach(t => {
        tabla.innerHTML += `
            <tr>
                <td>#${t.id}</td>
                <td>${t.usuario || 'Anónimo'}</td>
                <td>${t.titulo}</td>
                <td><span class="prio-${t.prioridad}">${t.prioridad}</span></td>
                <td>${t.estado || 'Abierto'}</td>
            </tr>
        `;
    });
}