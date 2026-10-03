-- ==============================================================
-- Banco de Dados: sistema_usuarios (Acervo Virtual de Geociências)
-- Instituto Federal do Paraná (IFPR) - Campus Cascavel
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Amostras do Acervo (Rochas e Minerais)
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('rocha', 'mineral', 'geral') DEFAULT 'geral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
