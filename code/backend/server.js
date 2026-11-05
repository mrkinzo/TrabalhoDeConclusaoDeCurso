const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Configura limites para permitir o upload de imagens em Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Diretório para persistir imagens no servidor
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Servir as imagens salvas de forma estática
app.use('/uploads', express.static(uploadDir));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sistema_usuarios',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Inicialização automática das tabelas de amostras e imagens com CASCADE
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS amostras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                categoria ENUM('rocha', 'mineral') NOT NULL,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                dureza VARCHAR(100),
                imagem1 VARCHAR(500) NOT NULL,
                imagem2 VARCHAR(500) DEFAULT NULL,
                imagem3 VARCHAR(500) DEFAULT NULL,
                tipo_rocha ENUM('Ignea', 'Sedimentar', 'Metamorfica') DEFAULT NULL,
                padrao_geometrico VARCHAR(150) DEFAULT NULL,
                clivagem VARCHAR(100) DEFAULT NULL,
                grupo_mineral VARCHAR(150) DEFAULT NULL,
                criado_por INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_amostras_usuario FOREIGN KEY (criado_por) 
                    REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS amostra_imagens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amostra_id INT NOT NULL,
                url VARCHAR(500) NOT NULL,
                ordem INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_amostra_imagens_amostra FOREIGN KEY (amostra_id) 
                    REFERENCES amostras(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabelas "amostras" e "amostra_imagens" verificadas/criadas com sucesso no banco.');

        // Se a tabela estiver vazia, popula com as 6 rochas e 6 minerais do acervo
        const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM amostras');
        if (totalRows[0].total === 0) {
            console.log('Populando banco com as amostras iniciais do acervo...');
            const seedAmostras = [
                // Rochas
                { categoria: 'rocha', nome: 'Basalto', tipo_rocha: 'Ignea', dureza: '6.0', imagem1: '../../basalto.jpg', imagem2: '../../basalto2.jpg', imagem3: '../../basalto3.jpg', descricao: 'O basalto é uma rocha magmática efusiva de composição máfica, rica em silicatos de magnésio e ferro e em plagioclásio cálcico.' },
                { categoria: 'rocha', nome: 'Obsidiana', tipo_rocha: 'Ignea', dureza: '5.5', imagem1: '../../obisidiana1.jpg', imagem2: '../../obisidiana2.jpg', imagem3: '../../obisidiana3.jpg', descricao: 'A obsidiana é uma rocha ígnea extrusiva constituída quase inteiramente por vidro vulcânico negro ou cinza escuro, formada pelo resfriamento ultrarrápido da lava.' },
                { categoria: 'rocha', nome: 'Calcario', tipo_rocha: 'Sedimentar', dureza: '3.0', imagem1: '../../calcario1.jpg', imagem2: '../../calcario2.jpg', imagem3: '../../calcario3.jpg', descricao: 'O calcário é uma rocha sedimentar constituída predominantemente por carbonato de cálcio sob a forma de calcita ou aragonita.' },
                { categoria: 'rocha', nome: 'Arenito', tipo_rocha: 'Sedimentar', dureza: '6.5', imagem1: '../../arenito1.jpg', imagem2: '../../arenito2.jpg', imagem3: '../../arenito 3.jpg', descricao: 'O arenito é uma rocha sedimentar clástica resultante da compactação e cimentação de grãos de areia quartzoza.' },
                { categoria: 'rocha', nome: 'Ardosia', tipo_rocha: 'Metamorfica', dureza: '3.5', imagem1: '../../ardosia1.jpg', imagem2: '../../ardosia2.jpg', imagem3: '../../ardosia 3.jpg', descricao: 'A ardósia é uma rocha metamórfica foliada de granulação fina, formada pelo metamorfismo regional de baixa intensidade sobre folhelhos ou argilitos.' },
                { categoria: 'rocha', nome: 'Charnockito', tipo_rocha: 'Metamorfica', dureza: '6.0', imagem1: '../../charnokito1.jpg', imagem2: '../../charnokito2.jpg', imagem3: '../../charnokito3.jpg', descricao: 'O charnockito é uma rocha metamórfica de alto grau característica da fácies granulito, contendo ortopiroxênio associado a quartzo e feldspato.' },
                // Minerais
                { categoria: 'mineral', nome: 'Quartzo', grupo_mineral: 'Silicatos', padrao_geometrico: 'Hexagonal', clivagem: 'Fratura', dureza: '7.0', imagem1: '../../quartzo1.jpg', imagem2: '../../quartzo2.jpg', imagem3: '../../quartzo3.jpg', descricao: 'O quartzo é o mineral mais abundante da crosta continental (SiO2), caracterizado pela dureza 7 na escala de Mohs e ausência de clivagem.' },
                { categoria: 'mineral', nome: 'Enxofre', grupo_mineral: 'Elementos nativos', padrao_geometrico: 'Ortorrômbico', clivagem: 'Fratura', dureza: '2.0', imagem1: '../../enxofre2.jpg', imagem2: '../../enxofre1.jpg', imagem3: '../../enxofre3.jpg', descricao: 'O enxofre nativo é um mineral amarelo brilhante, formado comumente por sublimação em regiões vulcânicas ou por alteração de sulfetos.' },
                { categoria: 'mineral', nome: 'Opala', grupo_mineral: 'Silicatos', padrao_geometrico: 'Amorfo / Mineralóide', clivagem: 'Fratura', dureza: '5.5', imagem1: '../../opala1.jpg', imagem2: '../../opala2.jpg', imagem3: '../../opala3].jpg', descricao: 'A opala é um mineralóide de sílica amorfa hidratada, famosa pelo jogo de cores e reflexos iridescentes causados por esferas microscópicas de sílica.' },
                { categoria: 'mineral', nome: 'Feldspato', grupo_mineral: 'Silicatos', padrao_geometrico: 'Monoclínico / Triclínico', clivagem: '2 direções', dureza: '6.0', imagem1: '../../feldspato1.jpg', imagem2: '../../feldspato2.jpg', imagem3: '../../feldspato3.jpg', descricao: 'Os feldspatos constituem a família de tectossilicatos mais abundante na crosta, com clivagem perfeita em dois sentidos quase perpendiculares.' },
                { categoria: 'mineral', nome: 'Leopardita', grupo_mineral: 'Silicatos', padrao_geometrico: 'Criptocristalino', clivagem: 'Fratura', dureza: '6.5', imagem1: '../../leopardita 1.jpg', imagem2: '../../leopardita2.jpg', imagem3: '../../leopardita3.jpg', descricao: 'A leopardita é uma rocha/mineralóide constituída por pórfiro feldspático com manchas escuras de óxidos de ferro e manganês em padrão de pele de leopardo.' },
                { categoria: 'mineral', nome: 'Halita', grupo_mineral: 'Haloides', padrao_geometrico: 'Cúbico (Isométrico)', clivagem: '3 direções', dureza: '2.5', imagem1: '../../halita1.jpg', imagem2: '../../halita2.jpg', imagem3: '../../halita3.jpg', descricao: 'A halita (NaCl) é o sal-gema comum, caracterizado por hábito cúbico cristalino perfeito, clivagem cúbica em 3 direções a 90 graus e sabor salgado.' }
            ];

            for (const s of seedAmostras) {
                const [res] = await pool.query(
                    `INSERT INTO amostras (categoria, nome, descricao, dureza, imagem1, imagem2, imagem3, tipo_rocha, padrao_geometrico, clivagem, grupo_mineral)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [s.categoria, s.nome, s.descricao, s.dureza, s.imagem1, s.imagem2, s.imagem3, s.tipo_rocha || null, s.padrao_geometrico || null, s.clivagem || null, s.grupo_mineral || null]
                );
                await pool.query('INSERT INTO amostra_imagens (amostra_id, url, ordem) VALUES (?, ?, ?)', [res.insertId, s.imagem1, 1]);
                if (s.imagem2) await pool.query('INSERT INTO amostra_imagens (amostra_id, url, ordem) VALUES (?, ?, ?)', [res.insertId, s.imagem2, 2]);
                if (s.imagem3) await pool.query('INSERT INTO amostra_imagens (amostra_id, url, ordem) VALUES (?, ?, ?)', [res.insertId, s.imagem3, 3]);
            }
            console.log('Catálogo inicial populado com sucesso no banco de dados!');
        }
    } catch (err) {
        console.warn('Aviso ao inicializar tabelas:', err.message);
    }
}
initDatabase();

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

// Salva imagens em Base64 no disco (backend/uploads) para persistência permanente
function salvarImagemBase64(dataString, prefixo = 'amostra') {
    if (!dataString || typeof dataString !== 'string') return null;

    // Se já for uma URL web ou caminho relativo existente, mantém
    if (!dataString.startsWith('data:image/')) {
        return dataString;
    }

    const matches = dataString.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) return null;

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext.includes('svg')) ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const nomeArquivo = `${prefixo}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const caminhoCompleto = path.join(uploadDir, nomeArquivo);

    fs.writeFileSync(caminhoCompleto, buffer);
    return `http://localhost:3000/uploads/${nomeArquivo}`;
}

// Verifica permissões do usuário no banco
async function obterPermissoesUsuario(userId) {
    if (!userId) return null;
    const [rows] = await pool.query('SELECT id, username, ADMIN, PROFESSOR, REDATOR FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return null;
    return {
        id: rows[0].id,
        nome: rows[0].username,
        isAdmin: Boolean(rows[0].ADMIN),
        isProfessor: Boolean(rows[0].PROFESSOR),
        isRedator: Boolean(rows[0].REDATOR)
    };
}

// ==========================================
// ROTAS DE AUTENTICAÇÃO E USUÁRIOS
// ==========================================

app.post('/api/registrar', async (req, res) => {
    try {
        const { name, email, password, isTeacher, isRedator } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (username, email, password_hash, PROFESSOR, REDATOR) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [name, email, password_hash, isTeacher, isRedator];
        const [resultado] = await pool.query(sql, values);

        res.json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso! ID: ' + resultado.insertId });

    } catch (erro) {
        console.error('Erro no registro:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ou usuário já existente.' });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const sql = 'SELECT id, username, email, ADMIN, PROFESSOR, REDATOR FROM users';
        const [usuarios] = await pool.query(sql);
        res.json(usuarios);
    } catch (erro) {
        console.error('Erro ao buscar usuários:', erro);
        res.status(500).json({ erro: 'Erro ao buscar os dados.' });
    }
});

app.get('/api/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await obterPermissoesUsuario(id);

        if (!user) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
        }

        res.json({
            sucesso: true,
            usuario: user
        });

    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.query(sql, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos.' });
        }

        const user = rows[0];
        const senhaCorreta = await bcrypt.compare(password, user.password_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos.' });
        }

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: user.id,
                nome: user.username,
                email: user.email,
                isAdmin: Boolean(user.ADMIN),
                isProfessor: Boolean(user.PROFESSOR),
                isRedator: Boolean(user.REDATOR)
            }
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});

// ==========================================
// ROTAS DE AMOSTRAS (ROCHAS E MINERAIS)
// ==========================================

// Listar amostras (com filtro opcional por categoria: 'rocha' ou 'mineral')
app.get('/api/amostras', async (req, res) => {
    try {
        const { categoria } = req.query;

        let sql = `
            SELECT a.*, u.username AS autor_nome 
            FROM amostras a 
            LEFT JOIN users u ON a.criado_por = u.id
        `;
        const params = [];

        if (categoria && (categoria === 'rocha' || categoria === 'mineral')) {
            sql += ' WHERE a.categoria = ?';
            params.push(categoria);
        }

        sql += ' ORDER BY a.id DESC';

        const [amostras] = await pool.query(sql, params);
        res.json({ sucesso: true, amostras });
    } catch (erro) {
        console.error('Erro ao listar amostras:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar amostras no banco de dados.' });
    }
});

// Buscar detalhes de UMA amostra específica por ID (com todas as imagens da tabela amostra_imagens)
app.get('/api/amostras/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT a.*, u.username AS autor_nome 
            FROM amostras a 
            LEFT JOIN users u ON a.criado_por = u.id 
            WHERE a.id = ?
        `;
        const [rows] = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Amostra não encontrada.' });
        }

        const amostra = rows[0];

        // Buscar imagens vinculadas na tabela relacional amostra_imagens
        const [imagensRows] = await pool.query(
            'SELECT url, ordem FROM amostra_imagens WHERE amostra_id = ? ORDER BY ordem ASC',
            [id]
        );

        // Monta lista de imagens (garantindo que imagem1, imagem2, imagem3 estejam inclusas)
        let imagens = imagensRows.map(r => r.url);
        if (imagens.length === 0) {
            if (amostra.imagem1) imagens.push(amostra.imagem1);
            if (amostra.imagem2) imagens.push(amostra.imagem2);
            if (amostra.imagem3) imagens.push(amostra.imagem3);
        }

        res.json({
            sucesso: true,
            amostra: {
                ...amostra,
                imagens
            }
        });
    } catch (erro) {
        console.error('Erro ao buscar amostra por ID:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar detalhes da amostra.' });
    }
});

// Cadastrar amostra (Apenas ADMIN ou REDATOR)
app.post('/api/amostras', async (req, res) => {
    try {
        const {
            categoria,
            nome,
            descricao,
            dureza,
            imagem1,
            imagem2,
            imagem3,
            tipo_rocha,
            padrao_geometrico,
            clivagem,
            grupo_mineral,
            usuarioId
        } = req.body;

        // 1. Validação de autenticação e permissões (RBAC)
        const user = await obterPermissoesUsuario(usuarioId);
        if (!user || (!user.isAdmin && !user.isRedator)) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado: Apenas Administradores e Redatores podem cadastrar amostras.'
            });
        }

        // 2. Validações básicas
        if (!categoria || !['rocha', 'mineral'].includes(categoria)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Categoria inválida. Escolha rocha ou mineral.' });
        }

        if (!nome || !nome.trim()) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome da amostra é obrigatório.' });
        }

        if (!imagem1) {
            return res.status(400).json({ sucesso: false, mensagem: 'A imagem principal do card é obrigatória.' });
        }

        // 3. Persistência de arquivos das 3 imagens
        const url1 = salvarImagemBase64(imagem1, `card-${categoria}`) || imagem1;
        const url2 = salvarImagemBase64(imagem2, `foto2-${categoria}`) || imagem2 || null;
        const url3 = salvarImagemBase64(imagem3, `foto3-${categoria}`) || imagem3 || null;

        // 4. Inserção na tabela unificada 'amostras'
        const sqlAmostra = `
            INSERT INTO amostras 
            (categoria, nome, descricao, dureza, imagem1, imagem2, imagem3, 
             tipo_rocha, padrao_geometrico, clivagem, grupo_mineral, criado_por) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valuesAmostra = [
            categoria,
            nome.trim(),
            descricao || '',
            dureza || '',
            url1,
            url2,
            url3,
            categoria === 'rocha' ? (tipo_rocha || null) : null,
            categoria === 'mineral' ? (padrao_geometrico || null) : null,
            categoria === 'mineral' ? (clivagem || null) : null,
            categoria === 'mineral' ? (grupo_mineral || null) : null,
            user.id
        ];

        const [resultado] = await pool.query(sqlAmostra, valuesAmostra);
        const novoId = resultado.insertId;

        // 5. Inserção das imagens na tabela relacional 'amostra_imagens' (para integridade e deleção CASCADE)
        const sqlImagem = 'INSERT INTO amostra_imagens (amostra_id, url, ordem) VALUES (?, ?, ?)';
        if (url1) await pool.query(sqlImagem, [novoId, url1, 1]);
        if (url2) await pool.query(sqlImagem, [novoId, url2, 2]);
        if (url3) await pool.query(sqlImagem, [novoId, url3, 3]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Amostra cadastrada com sucesso!',
            id: novoId
        });

    } catch (erro) {
        console.error('Erro ao cadastrar amostra:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor ao salvar a amostra.' });
    }
});

// Editar amostra existente (Apenas ADMIN ou REDATOR)
app.put('/api/amostras/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nome,
            descricao,
            dureza,
            imagem1,
            imagem2,
            imagem3,
            tipo_rocha,
            padrao_geometrico,
            clivagem,
            grupo_mineral,
            usuarioId
        } = req.body;

        // 1. Validação de permissões
        const user = await obterPermissoesUsuario(usuarioId);
        if (!user || (!user.isAdmin && !user.isRedator)) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado: Apenas Administradores e Redatores podem editar amostras.'
            });
        }

        // 2. Verifica se a amostra existe
        const [existe] = await pool.query('SELECT * FROM amostras WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Amostra não encontrada.' });
        }
        const atual = existe[0];

        // 3. Processar novas imagens se foram enviadas em Base64
        const url1 = imagem1 ? (salvarImagemBase64(imagem1, `card-${atual.categoria}`) || imagem1) : atual.imagem1;
        const url2 = imagem2 ? (salvarImagemBase64(imagem2, `foto2-${atual.categoria}`) || imagem2) : atual.imagem2;
        const url3 = imagem3 ? (salvarImagemBase64(imagem3, `foto3-${atual.categoria}`) || imagem3) : atual.imagem3;

        // 4. Atualizar registro principal
        const sqlUpdate = `
            UPDATE amostras 
            SET nome = ?, descricao = ?, dureza = ?, imagem1 = ?, imagem2 = ?, imagem3 = ?,
                tipo_rocha = ?, padrao_geometrico = ?, clivagem = ?, grupo_mineral = ?
            WHERE id = ?
        `;

        await pool.query(sqlUpdate, [
            nome ? nome.trim() : atual.nome,
            descricao !== undefined ? descricao : atual.descricao,
            dureza !== undefined ? dureza : atual.dureza,
            url1,
            url2,
            url3,
            atual.categoria === 'rocha' ? (tipo_rocha || atual.tipo_rocha) : null,
            atual.categoria === 'mineral' ? (padrao_geometrico || atual.padrao_geometrico) : null,
            atual.categoria === 'mineral' ? (clivagem || atual.clivagem) : null,
            atual.categoria === 'mineral' ? (grupo_mineral || atual.grupo_mineral) : null,
            id
        ]);

        // 5. Atualizar tabela relacional amostra_imagens
        await pool.query('DELETE FROM amostra_imagens WHERE amostra_id = ?', [id]);
        const sqlImagem = 'INSERT INTO amostra_imagens (amostra_id, url, ordem) VALUES (?, ?, ?)';
        if (url1) await pool.query(sqlImagem, [id, url1, 1]);
        if (url2) await pool.query(sqlImagem, [id, url2, 2]);
        if (url3) await pool.query(sqlImagem, [id, url3, 3]);

        res.json({
            sucesso: true,
            mensagem: 'Amostra atualizada com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao atualizar amostra:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao atualizar amostra.' });
    }
});

// Apagar amostra (EXCLUSIVO PARA ADMINISTRADORES - COM DELEÇÃO EM CASCATA NO BANCO)
app.delete('/api/amostras/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.body?.usuarioId || req.headers['x-usuario-id'];

        // 1. Validação estrita: SOMENTE ADM pode apagar
        const user = await obterPermissoesUsuario(usuarioId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado: Somente Administradores (ADM) têm permissão para apagar amostras.'
            });
        }

        // 2. Busca imagens vinculadas para limpar arquivos físicos de uploads locais
        const [imgs] = await pool.query('SELECT url FROM amostra_imagens WHERE amostra_id = ?', [id]);
        for (const img of imgs) {
            if (img.url && img.url.includes('/uploads/')) {
                const nomeArquivo = path.basename(img.url);
                const caminho = path.join(uploadDir, nomeArquivo);
                if (fs.existsSync(caminho)) {
                    try { fs.unlinkSync(caminho); } catch (e) { console.warn('Erro ao deletar arquivo:', e); }
                }
            }
        }

        // 3. Exclui a amostra do banco.
        // A chave estrangeira fk_amostra_imagens_amostra com ON DELETE CASCADE
        // garante a remoção em cascata automática de todos os registros filhos em amostra_imagens.
        const [resultado] = await pool.query('DELETE FROM amostras WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Amostra não encontrada para exclusão.' });
        }

        res.json({
            sucesso: true,
            mensagem: 'Amostra e dados relacionados excluídos do banco de dados em cascata com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao apagar amostra:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao excluir amostra.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
    console.log('Uploads disponíveis em http://localhost:3000/uploads');
});