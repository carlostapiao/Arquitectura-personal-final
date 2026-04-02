const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: false }
};

// Ruta de Salud (Evita que K8s piense que la app está muerta)
app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('/api/tickets', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Tickets');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en DB:", err.message);
        res.status(500).json({ error: "Error conectando a la base de datos" });
    }
});

app.post('/api/tickets', async (req, res) => {
    try {
        const { titulo, descripcion, prioridad } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('titulo', sql.VarChar, titulo)
            .input('descripcion', sql.Text, descripcion)
            .input('prioridad', sql.VarChar, prioridad)
            .query('INSERT INTO Tickets (titulo, descripcion, prioridad) VALUES (@titulo, @descripcion, @prioridad)');
        res.status(201).json({ message: "Ticket creado" });
    } catch (err) {
        console.error("Error insertando:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});