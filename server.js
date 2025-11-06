const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); 

// Conectar ao banco de dados (SQLite3)
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            price REAL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Client (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT,
            email TEXT
        )`);
        console.log('Tabelas criadas ou já existem.');
    });
  }
});

// ROTAS DE AUTENTICAÇÃO (LOGIN E CADASTRO DE USUÁRIO)
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = 'INSERT INTO User (username, email, password) VALUES (?, ?, ?)';

        db.run(sql, [username, normalizedEmail, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: 'Erro ao cadastrar usuário. Tente outro username/email.' });
            }
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao processar a senha.' });
    }
});

// Rota de Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const sql = 'SELECT * FROM User WHERE email = ?';

    db.get(sql, [normalizedEmail], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
        try {
            const match = await bcrypt.compare(password, row.password);

            if (match) {
                res.json({ message: 'Login bem-sucedido!', user: { id: row.id, email: row.email } });
            } else {
                res.status(401).json({ error: 'Email ou senha inválidos.' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erro na comparação de senha.' });
        }
    });
});

// ROTAS de CRUD (PRODUTO)

app.post('/api/products', (req, res) => {
    const { name, description, price } = req.body;
    const sql = 'INSERT INTO Product (name, description, price) VALUES (?, ?, ?)';
    db.run(sql, [name, description, price], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Produto criado', id: this.lastID });
    });
});

app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM Product', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/products/:id', (req, res) => {
    const { name, description, price } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE Product SET name = ?, description = ?, price = ? WHERE id = ?';
    db.run(sql, [name, description, price, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json({ message: 'Produto atualizado' });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Product WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json({ message: 'Produto deletado' });
    });
});

// Rota de CRUD (CLIENTE)

app.post('/api/clients', (req, res) => {
    const { name, phone, email } = req.body;
    const sql = 'INSERT INTO Client (name, phone, email) VALUES (?, ?, ?)';
    db.run(sql, [name, phone, email], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Cliente criado', id: this.lastID });
    });
});

app.get('/api/clients', (req, res) => {
    db.all('SELECT * FROM Client', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/clients/:id', (req, res) => {
    const { name, phone, email } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE Client SET name = ?, phone = ?, email = ? WHERE id = ?';
    db.run(sql, [name, phone, email, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
        res.json({ message: 'Cliente atualizado' });
    });
});

app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Client WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
        res.json({ message: 'Cliente deletado' });
    });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});