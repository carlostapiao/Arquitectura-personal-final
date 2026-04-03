const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

app.use(express.json());
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: false }
};

// Ruta de Salud para Kubernetes
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- EL SELECT QUE TE FALTABA ---
app.get('/api/tickets', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        // Traemos todos los tickets ordenados por ID descendente (los nuevos primero)
        let result = await pool.request().query('SELECT * FROM Tickets ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en GET /api/tickets:", err.message);
        res.status(500).json({ error: "Error al obtener los tickets" });
    }
});

// --- EL INSERT PARA CREAR TICKETS ---
app.post('/api/tickets', async (req, res) => {
    try {
        const { titulo, descripcion, prioridad, usuario } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('titulo', sql.VarChar, titulo)
            .input('descripcion', sql.Text, descripcion)
            .input('prioridad', sql.VarChar, prioridad)
            .input('usuario', sql.VarChar, usuario)
            .query('INSERT INTO Tickets (titulo, descripcion, prioridad, usuario, estado) VALUES (@titulo, @descripcion, @prioridad, @usuario, \'Abierto\')');
        
        res.status(201).json({ message: "Ticket creado con éxito" });
    } catch (err) {
        console.error("Error en POST /api/tickets:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Soporte IT activo en puerto ${PORT}`);
});