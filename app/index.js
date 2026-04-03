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

// Obtener todos los tickets (SELECT)
app.get('/api/tickets', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Tickets ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en GET /api/tickets:", err.message);
        res.status(500).json({ error: "Error al obtener los tickets" });
    }
});

// Crear un nuevo ticket (INSERT)
app.post('/api/tickets', async (req, res) => {
    try {
        // EXTRA: Mapeo flexible para evitar el error de NULL en la DB
        const titulo = req.body.titulo || req.body.asunto; 
        const usuario = req.body.usuario || 'Anónimo';
        const prioridad = req.body.prioridad || 'Media';
        const descripcion = req.body.descripcion || 'Sin descripción';

        // Si después de intentar mapear, el título sigue vacío, lanzamos un error claro
        if (!titulo) {
            return res.status(400).json({ error: "El campo 'titulo' o 'asunto' es obligatorio para la DB" });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Soporte IT activo en puerto ${PORT}`);
});