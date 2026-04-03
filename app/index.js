// ... (mismo dbConfig de antes)

app.post('/api/tickets', async (req, res) => {
    try {
        const { titulo, descripcion, prioridad, usuario } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('titulo', sql.VarChar, titulo)
            .input('descripcion', sql.Text, descripcion)
            .input('prioridad', sql.VarChar, prioridad)
            .input('usuario', sql.VarChar, usuario) // Nuevo campo
            .query('INSERT INTO Tickets (titulo, descripcion, prioridad, usuario, estado) VALUES (@titulo, @descripcion, @prioridad, @usuario, \'Abierto\')');
        res.status(201).json({ message: "Ticket creado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});