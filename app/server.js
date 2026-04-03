const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

// 1. Middlewares para procesar JSON
app.use(express.json());

// 2. SERVIR ARCHIVOS ESTÁTICOS (LA CLAVE DEL ÉXITO)
// Configuramos el servidor para que responda en la raíz Y en /v1 (para el APIM)
const publicPath = path.join(__dirname, 'src', 'public');
app.use(express.static(publicPath));
app.use('/v1', express.static(publicPath)); 

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

// 4. Rutas de la API
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

app.post('/api/tickets', async (req, res) => {
    try {
        const { usuario, titulo, prioridad, descripcion } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('titulo', sql.VarChar, titulo)
            .input('descripcion', sql.Text, descripcion || '')
            .input('prioridad', sql.VarChar, prioridad || 'Media')
            .input('usuario', sql.VarChar, usuario || 'Anónimo')
            .query(`INSERT INTO Tickets (titulo, descripcion, prioridad, usuario, estado) 
                    VALUES (@titulo, @descripcion, @prioridad, @usuario, 'Abierto')`);
        
        res.status(201).json({ message: "Ticket creado" });
    } catch (err) {
        console.error("❌ Error SQL POST:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. Captura de rutas para el Frontend (SPA Mode)
// Si no es una API, entrega el index.html
app.get(['/', '/v1', '/v1/'], (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 6. Inicio del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📂 Archivos servidos desde: ${publicPath}`);
});