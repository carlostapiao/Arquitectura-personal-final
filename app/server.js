const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

// 1. Middlewares
app.use(express.json());

// 2. Servir archivos estáticos (Frontend)
// AJUSTE: Ahora entra a 'src' y luego a 'public' para coincidir con tu VS Code
app.use(express.static(path.join(__dirname, 'src', 'public')));

// 3. Configuración de Base de Datos (Azure SQL)
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

// 4. Ruta de Salud (Check para Kubernetes / APIM)
app.get('/health', (req, res) => res.status(200).send('OK - Servidor Vivo'));

// --- API: OBTENER TICKETS (GET) ---
app.get('/api/tickets', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Tickets ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error SQL GET:", err.message);
        res.status(500).json({ error: "Error de conexión a la base de datos" });
    }
});

// --- API: CREAR TICKET (POST) ---
app.post('/api/tickets', async (req, res) => {
    try {
        const { usuario, titulo, prioridad, descripcion } = req.body;
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
        console.error("❌ Error SQL POST:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. Captura cualquier otra ruta y entrega el index.html
// AJUSTE: Ruta corregida a 'src/public' para evitar el error ENOENT
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

// 6. Inicio del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Backend corriendo en puerto ${PORT}`);
    console.log(`📂 Buscando archivos en: ${path.join(__dirname, 'src', 'public')}`);
});