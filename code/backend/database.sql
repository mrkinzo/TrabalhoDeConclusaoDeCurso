-- ==============================================================
-- Banco de Dados: sistema_usuarios (Acervo Virtual de Geociências)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS sistema_usuarios
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_usuarios;

-- Tabela de Usuários (Autenticação e Controle de Acesso - RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ADMIN BOOLEAN DEFAULT FALSE,
    PROFESSOR BOOLEAN DEFAULT FALSE,
    REDATOR BOOLEAN DEFAULT FALSE,
    solicitacao_redator ENUM('nenhuma', 'pendente', 'aprovado', 'reprovado') DEFAULT 'nenhuma',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- Tabela de Auditoria das Operações do Banco de Dados (Heurística 9)
-- Registra todas as ações administrativas, alterações no catálogo,
-- registros de usuários e controle de aprovação de redatores.
-- Acesso restrito exclusivamente ao Administrador.
-- ==============================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    usuario_nome VARCHAR(100) DEFAULT NULL,
    acao VARCHAR(50) NOT NULL,
    tabela_afetada VARCHAR(50) NOT NULL,
    registro_id INT DEFAULT NULL,
    detalhes TEXT DEFAULT NULL,
    ip VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================================
-- Tabela Unificada de Amostras (Rochas e Minerais)
-- Contém os dados presentes em ambos (nome, descrição, dureza, 3 fotos)
-- e os atributos específicos de cada categoria.
-- ==============================================================
CREATE TABLE IF NOT EXISTS amostras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria ENUM('rocha', 'mineral') NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    dureza VARCHAR(100),
    imagem1 VARCHAR(500) NOT NULL, -- Imagem principal do card no catálogo e 1ª do carrossel
    imagem2 VARCHAR(500) DEFAULT NULL, -- 2ª imagem do carrossel
    imagem3 VARCHAR(500) DEFAULT NULL, -- 3ª imagem do carrossel
    
    -- Atributos específicos para Rocha:
    tipo_rocha ENUM('Ignea', 'Sedimentar', 'Metamorfica') DEFAULT NULL,
    
    -- Atributos específicos para Mineral:
    padrao_geometrico VARCHAR(150) DEFAULT NULL,
    clivagem VARCHAR(100) DEFAULT NULL,
    grupo_mineral VARCHAR(150) DEFAULT NULL,
    
    -- Auditoria
    criado_por INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_amostras_usuario FOREIGN KEY (criado_por) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================================
-- Tabela Relacional de Imagens com Deleção em Cascata (CASCADE)
-- Garante integridade referencial: ao apagar uma amostra, todas
-- as suas imagens associadas são excluídas automaticamente em cascata.
-- ==============================================================
CREATE TABLE IF NOT EXISTS amostra_imagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amostra_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    ordem INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_amostra_imagens_amostra FOREIGN KEY (amostra_id) 
        REFERENCES amostras(id) ON DELETE CASCADE
);

-- Tabela legada de Amostras (mantida para compatibilidade com versões anteriores)
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('rocha', 'mineral', 'selecione') DEFAULT 'selecione',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
