const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM correspondentes ORDER BY nome ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    const { nome, telefone } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO correspondentes (nome, telefone) VALUES ($1, $2) RETURNING *',
            [nome, telefone]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { nome, telefone } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE correspondentes SET nome = $1, telefone = $2 WHERE id = $3 RETURNING *',
            [nome, telefone, id]
        );
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM correspondentes WHERE id = $1', [id]);
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
