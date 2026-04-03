const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

// Configuración de JSON para recibir datos del frontend y APIM
app.use(express.json());

// --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS ---
// Esto le dice a Express que busque index.html, style.css y script.js en 'public'
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { 
        encrypt: true, 
        trustServerCertificate: false 
    }
};

// Ruta de Salud (Liveness/Readiness probe para Kubernetes)
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- API: OBTENER TICKETS (GET) ---
app.get('/api/tickets', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Tickets ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en GET /api/tickets:", err.message);
        res.status(500).json({ error: "Error al conectar con la base de datos SQL" });
    }
});

// --- API: CREAR TICKET (POST) ---
app.post('/api/tickets', async (req, res) => {
    try {
        // Mapeo flexible: Acepta 'titulo' (DB) o 'asunto' (Frontend antiguo/APIM)
        const titulo = req.body.titulo || req.body.asunto;
        const usuario = req.body.usuario || 'Anónimo';
        const prioridad = req.body.prioridad || 'Media';
        const descripcion = req.body.descripcion || 'Ticket creado desde Lab 21';

        if (!titulo) {
            return res.status(400).json({ error: "El campo 'titulo' es obligatorio" });
        }

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

// Captura cualquier otra ruta y sirve el index.html (Útil para Single Page Apps)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Backend ejecutándose en puerto ${PORT}`);
});