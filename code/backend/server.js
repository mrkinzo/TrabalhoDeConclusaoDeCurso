const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sistema_usuarios'
});

app.post('/api/registrar', async (req, res) => {
    try {
        const { name, email, password, isTeacher, isRedator } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (username, email, password_hash, PROFESSOR, REDATOR) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [name, email, password_hash, isTeacher, isRedator];

        // Executa a query
        const [resultado] = await pool.query(sql, values);

        res.json({ sucesso: true, mensagem: 'Usuário ID ' + resultado.insertId });

    } catch (erro) {
        console.error('Erro no banco:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ou usuário já existente.' });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {

        const sql = 'SELECT id, username, email, PROFESSOR, REDATOR FROM users';
        const [usuarios] = await pool.query(sql);

        res.json(usuarios);
    } catch (erro) {
        console.error('Erro ao buscar usuários:', erro);
        res.status(500).json({ erro: 'Erro ao buscar os dados.' });
    }
});

// Rota para buscar os dados atualizados de UM usuário específico (usada na página de perfil)
app.get('/api/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'SELECT id, username, email, ADMIN, PROFESSOR, REDATOR FROM users WHERE id = ?';
        const [rows] = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
        }

        const user = rows[0];

        res.json({
            sucesso: true,
            usuario: {
                id: user.id,
                nome: user.username,
                email: user.email,
                isAdmin: user.ADMIN,
                isProfessor: user.PROFESSOR,
                isRedator: user.REDATOR
            }
        });

    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});

// Rota para fazer o Login
app.post('/api/login', async (req, res) => {
    try {
        // Recebe o e-mail e a senha digitados no frontend
        const { email, password } = req.body;

        // 1. Busca o usuário no banco pelo e-mail
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.query(sql, [email]);

        // Se o array "rows" estiver vazio, o e-mail não existe no banco
        if (rows.length === 0) {
            // Status 401 significa "Não Autorizado"
            return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos.' });
        }

        const user = rows[0]; // Pega o primeiro (e único) usuário encontrado

        // 2. Compara a senha digitada com o "password_hash" salvo no banco
        const senhaCorreta = await bcrypt.compare(password, user.password_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos.' });
        }

        // 3. Login com sucesso! 
        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: user.id,
                nome: user.username,
                email: user.email,
                isAdmin: user.ADMIN,
                isProfessor: user.PROFESSOR,
                isRedator: user.REDATOR
            }
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});



app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});