const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

// 1. Middlewares
app.use(express.json());

// 2. Servir archivos estáticos (Frontend)
// Esto busca index.html, script.js y style.css dentro de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 3. Configuración de Base de Datos (Variables de Entorno de Azure/K8s)
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

// 4. Ruta de Salud (Check para Kubernetes)
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- API: OBTENER TICKETS (GET) ---
app.get('/api/tickets', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Tickets ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error en SQL GET:", err.message);
        res.status(500).json({ error: "No se pudo conectar a la base de datos" });
    }
});

// --- API: CREAR TICKET (POST) ---
app.post('/api/tickets', async (req, res) => {
    try {
        const { usuario, titulo, prioridad, descripcion } = req.body;
        
        // Validación básica
        if (!titulo) return res.status(400).json({ error: "El título es obligatorio" });

        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('titulo', sql.VarChar, titulo)
            .input('descripcion', sql.Text, descripcion || '')
            .input('prioridad', sql.VarChar, prioridad || 'Media')
            .input('usuario', sql.VarChar, usuario || 'Anónimo')
            .query(`INSERT INTO Tickets (titulo, descripcion, prioridad, usuario, estado) 
                    VALUES (@titulo, @descripcion, @prioridad, @usuario, 'Abierto')`);
        
        res.status(201).json({ message: "Ticket creado con éxito" });
    } catch (err) {
        console.error("❌ Error en SQL POST:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. Captura cualquier otra ruta y entrega el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. Inicio del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Backend IT Support corriendo en puerto ${PORT}`);
});