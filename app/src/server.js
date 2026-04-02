const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tickets = [
    { id: 1, titulo: "Soporte Lab 21", descripcion: "Prueba inicial de ticket", prioridad: "Alta" }
];

app.get('/api/tickets', (req, res) => res.json(tickets));

app.post('/api/tickets', (req, res) => {
    const newTicket = { id: tickets.length + 1, ...req.body };
    tickets.push(newTicket);
    res.status(201).json(newTicket);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));