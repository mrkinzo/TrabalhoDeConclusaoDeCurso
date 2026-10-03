# 🪨 Studio - Acervo Virtual de Geociências (Rochas e Minerais)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)](https://getbootstrap.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![IFPR](https://img.shields.io/badge/IFPR-Campus%20Cascavel-darkgreen.svg)](https://cascavel.ifpr.edu.br/)

Projeto acadêmico de **Trabalho de Conclusão de Curso (TCC)** desenvolvido no **Instituto Federal do Paraná (IFPR) - Campus Cascavel**.

Consiste em uma plataforma web colaborativa e didática voltada à comunidade de geociências, projetada para catalogar, documentar e disponibilizar digitalmente o acervo físico de rochas e minerais da instituição para apoio em aulas, pesquisas e divulgação científica.

---

## 👥 Equipe do Projeto

- **Desenvolvedor e Autor:** [Eduardo Kinzo Ishida](mailto:eduardokinzo@gmail.com) (Aluno / Administrador & Dev)
- **Orientador e Curador do Acervo:** [Prof. Lineker Nunes](mailto:lineker.nunes@ifpr.edu.br) (Docente / Administrador)
- **Co-Orientador e revisor de desenvolvimento:** [Prof.Fernando de Lima:](mailto:Fernando.alves@ifpr.edu.br)
- **Instituição:** Instituto Federal do Paraná (IFPR) — Campus Cascavel

---

## 📌 Sumário

- [🪨 Studio - Acervo Virtual de Geociências (Rochas e Minerais)](#-studio---acervo-virtual-de-geociências-rochas-e-minerais)
  - [👥 Equipe do Projeto](#-equipe-do-projeto)
  - [📌 Sumário](#-sumário)
  - [📖 Sobre o Projeto](#-sobre-o-projeto)
  - [✨ Recursos Principais](#-recursos-principais)
  - [🏛️ Arquitetura do Sistema](#️-arquitetura-do-sistema)
  - [🧩 Padrões de Projeto (Design Patterns)](#-padrões-de-projeto-design-patterns)
  - [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Banco de Dados](#banco-de-dados)
  - [📂 Estrutura do Repositório](#-estrutura-do-repositório)
  - [🚀 Pré-requisitos e Instalação](#-pré-requisitos-e-instalação)
    - [1. Pré-requisitos](#1-pré-requisitos)
  - [🗄️ Configuração do Banco de Dados](#️-configuração-do-banco-de-dados)
  - [💻 Execução do Projeto](#-execução-do-projeto)
    - [Passo 1: Executando o Backend](#passo-1-executando-o-backend)
    - [Passo 2: Executando o Frontend](#passo-2-executando-o-frontend)
  - [📡 Documentação da API REST](#-documentação-da-api-rest)
    - [1. Registrar Novo Usuário](#1-registrar-novo-usuário)
    - [2. Autenticação (Login)](#2-autenticação-login)
    - [3. Consultar Perfil por ID](#3-consultar-perfil-por-id)
    - [4. Listar Todos os Usuários](#4-listar-todos-os-usuários)
  - [🔒 Controle de Acesso e Permissões (RBAC)](#-controle-de-acesso-e-permissões-rbac)
  - [🗺️ Próximos Passos (Roadmap)](#️-próximos-passos-roadmap)
  - [📄 Licença](#-licença)

---

## 📖 Sobre o Projeto

O acervo de geociências do IFPR abriga uma grande variedade de espécimes minerais e petrográficos essenciais para o aprendizado prático. Este projeto digitaliza esse acervo, disponibilizando:

- Amostras de rochas (magmáticas/ígneas, sedimentares e metamórficas) como **Basalto**, **Obsidiana**, **Calcário**, **Arenito**, **Ardósia** e **Charnockito**.
- Amostras de minerais com descrições morfológicas e físicas como **Quartzo**, **Enxofre**, **Opala**, **Feldspato**, **Leopardita** e **Halita**.
- Visualização fotográfica em múltiplos ângulos de alta resolução através de carrosséis interativos.
- Plataforma com autenticação segura e papéis de usuário para manter a curadoria e integridade das informações científicas.

---

## ✨ Recursos Principais

- 🔍 **Catálogo Visual Responsivo:** Apresentação em grade com *cards* estilizados e transições suaves ao passar o mouse (*hover effects*).
- 📷 **Carrossel de Imagens em Ângulos Múltiplos:** Cada página de amostra detalha três ou mais vistas fotográficas (Bootstrap Carousel).
- 🔐 **Sistema de Autenticação Completo:**
  - Cadastro de usuários com hash unidirecional de senhas com algoritmo **bcrypt**.
  - Login seguro com validação de credenciais.
  - Perfil do usuário logado (`usuario.html`) com exibição de crachás de papéis e opção de encerramento de sessão (*logout*).
- 🛡️ **Controle de Acesso Baseado em Papéis (RBAC):**
  - Diferenciação entre usuário padrão, professor, redator e administrador.
  - Regra de negócio: somente usuários com vínculo de professor podem se registrar como redatores.
  - Botão de ação rápida flutuante `+ Adicionar amostra` exibido estrategicamente apenas para Administradores e Redatores autenticados nas páginas do catálogo.
- ⚡ **Injeção Dinâmica de Interface (`auth.js`):** Atualização automática e reativa do cabeçalho de navegação (Navbar) em todas as páginas sem a necessidade de recarregar a sessão ou duplicar código de renderização.

---

## 🏛️ Arquitetura do Sistema

O sistema é construído sobre o modelo **Cliente-Servidor em Três Camadas (3-Tier Layered Architecture)**:

```
┌─────────────────────────────────────────────────────────────┐
│             1. Camada de Apresentação (Frontend)            │
│    HTML5 Semântico • CSS3 • Bootstrap 5.3.3 • Vanilla JS   │
│             Módulos: auth.js, script.js, login.js           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Requisições HTTP (JSON / REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             2. Camada de Aplicação (Backend API)             │
│        Node.js • Express.js • Middlewares (CORS, JSON)       │
│           Criptografia bcrypt • Pool de Conexões            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Instruções SQL Parametrizadas
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             3. Camada de Persistência (Database)            │
│                MySQL Relacional (sistema_usuarios)          │
│               Tabelas: users (RBAC), items (Acervo)         │
└─────────────────────────────────────────────────────────────┘
```

> 📄 **Documentação Completa de Arquitetura:** Para detalhes aprofundados sobre diagramas de fluxo, especificações C4, diagramas de sequência e modelagem formal, consulte o [Documento de Arquitetura de Software (ARCHITECTURE.md)](./ARCHITECTURE.md).

---

## 🧩 Padrões de Projeto (Design Patterns)

| Padrão | Categoria | Onde é Aplicado | Descrição / Benefício |
|---|---|---|---|
| **REST** | Arquitetural | Endpoints `/api/*` | Comunicação desacoplada, uniforme e sem estado (*stateless*) via HTTP e JSON. |
| **RBAC** | Arquitetural | `server.js` e `auth.js` | Controle de acesso baseado em papéis (`ADMIN`, `PROFESSOR`, `REDATOR`). |
| **Connection Pool** | Criacional | `mysql.createPool` em `server.js` | Reutilização de conexões ativas com o banco MySQL, aumentando o desempenho e reduzindo overhead de rede. |
| **Data Transfer Object (DTO)** | Estrutural | `class UserData` em `script.js` | Encapsulamento dos dados colhidos do formulário para transporte padronizado até a API. |
| **Decorator / Dynamic DOM Injection** | Estrutural | `auth.js` | Decora as páginas HTML estáticas em tempo de execução, injetando menus, botões de ação e dados do usuário logado. |
| **Facade** | Estrutural | `server.js` e chamadas `fetch` | Fornece interfaces simples e coesas ocultando a complexidade de rede e banco de dados. |
| **Chain of Responsibility / Middleware** | Comportamental | `app.use(express.json())`, `app.use(cors())` | Processamento sequencial de requisições através de interceptores na API Express. |
| **Observer (Event-Driven)** | Comportamental | `addEventListener` nos formulários e DOM | Tratamento assíncrono e não-bloqueante de interações do usuário no frontend. |
| **Strategy** | Comportamental | Renderização condicional em `auth.js` | Seleção do algoritmo de exibição visual baseado na identidade e nos papéis do usuário. |

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5:** Estruturação semântica das páginas de catálogo e autenticação.
- **CSS3:** Customização de tipografia, sombras, botões escuros minimalistas e transições responsivas.
- **Bootstrap 5.3.3:** Framework CSS para grid responsivo, navbar flexível e componente carrossel de fotos.
- **JavaScript (ES6+):** Manipulação de DOM, requisições assíncronas assíncronas via `fetch` API, ES Modules e armazenamento de sessão com `localStorage`.

### Backend
- **Node.js (v20+ / v26):** Ambiente de execução JavaScript no servidor.
- **Express.js (v4.21):** Framework web para roteamento e construção da API REST.
- **bcrypt (v5.1):** Biblioteca de hashing de senhas com salting adaptativo contra ataques de dicionário e rainbow tables.
- **cors (v2.8):** Mecanismo de segurança para habilitar Cross-Origin Resource Sharing.
- **mysql2 (v3.11):** Driver de alta performance para MySQL com suporte nativo a Promises e Connection Pooling.

### Banco de Dados
- **MySQL / MariaDB:** Banco relacional para armazenamento de usuários, permissões e catálogo.

---

## 📂 Estrutura do Repositório

```text
TrabalhoDeConclusaoDeCurso/
├── README.md                  # Este arquivo de documentação geral
└── code/
    ├── README.md              # Documentação técnica de apoio
    ├── ARCHITECTURE.md        # Documento de Arquitetura de Software detalhado
    ├── backend/               # Camada de Aplicação e Serviços
    │   ├── package.json       # Manifesto de dependências e scripts Node.js
    │   ├── server.js          # Servidor Express, rotas REST e conexão com MySQL
    │   └── database.sql       # Script DDL de criação do banco e tabelas
    └── frontend/              # Camada de Apresentação (Interface)
        ├── IndexHome.html     # Página inicial de boas-vindas
        ├── IndexAbout.html    # Página "Quem somos", histórico e contatos IFPR
        ├── index.html         # Catálogo principal da seção de Rochas
        ├── indexMin.html      # Catálogo principal da seção de Minerais
        ├── IndexPG1Rock.html ... IndexPG6Rock.html # Páginas individuais das rochas
        ├── IndexPG1Min.html  ... IndexPG6Min.html  # Páginas individuais dos minerais
        ├── login.html         # Formulário de autenticação (Entrar)
        ├── registro.html      # Formulário de cadastro de novos usuários
        ├── usuario.html       # Painel de perfil do usuário e logout
        ├── adicionar.html     # Formulário para inclusão de novas amostras
        ├── auth.js            # Script universal de hidratação de sessão e RBAC
        ├── login.js           # Controlador do formulário de login
        ├── script.js          # Controlador do cadastro (com classe DTO UserData)
        ├── style.css          # Folha de estilos padrão da aplicação
        └── stylePG.css        # Folha de estilos das páginas de amostras individuais
```

---

## 🚀 Pré-requisitos e Instalação

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (gerenciador de pacotes)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) ou MariaDB ativo

---

## 🗄️ Configuração do Banco de Dados

1. Inicie o serviço do MySQL no seu sistema operacional:
   ```bash
   # Exemplo no Linux:
   sudo systemctl start mysql
   ```

2. Crie a base de dados e as tabelas executando o script [`code/backend/database.sql`](./code/backend/database.sql):
   ```bash
   mysql -u root -p < code/backend/database.sql
   ```

   *Ou execute manualmente no seu cliente MySQL (MySQL Workbench, DBeaver, phpMyAdmin ou terminal):*
   ```sql
   CREATE DATABASE IF NOT EXISTS sistema_usuarios
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;

   USE sistema_usuarios;

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

   CREATE TABLE IF NOT EXISTS items (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       image_url VARCHAR(500) NOT NULL,
       category ENUM('rocha', 'mineral', 'geral') DEFAULT 'geral',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Se a senha do seu usuário `root` do MySQL for diferente de `'root'`, altere a configuração do pool de conexões em [`code/backend/server.js`](./code/backend/server.js):
   ```javascript
   const pool = mysql.createPool({
       host: 'localhost',
       user: 'SEU_USUARIO',
       password: 'SUA_SENHA',
       database: 'sistema_usuarios'
   });
   ```

---

## 💻 Execução do Projeto

### Passo 1: Executando o Backend
Abra um terminal, navegue até a pasta do backend e instale as dependências:
```bash
cd code/backend
npm install
```

Inicie o servidor da API:
```bash
npm start
```
> O servidor estará rodando em: `http://localhost:3000`

### Passo 2: Executando o Frontend
O frontend é composto por páginas estáticas enriquecidas com JavaScript. Você pode executá-lo de qualquer uma das seguintes formas:

- **Opção A (Extensão VS Code):** Abra a pasta `code/frontend` no Visual Studio Code e clique em **Go Live** com a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
- **Opção B (Servidor HTTP Node):**
  ```bash
  npx serve code/frontend
  # ou
  npx http-server code/frontend
  ```
- **Opção C (Navegador):** Abra o arquivo [`code/frontend/IndexHome.html`](./code/frontend/IndexHome.html) diretamente no seu navegador web preferido.

---

## 📡 Documentação da API REST

A API do backend opera na base `http://localhost:3000`.

### 1. Registrar Novo Usuário
- **Rota:** `POST /api/registrar`
- **Cabeçalho:** `Content-Type: application/json`
- **Corpo da Requisição (Body):**
  ```json
  {
    "name": "Maria Silva",
    "email": "maria@ifpr.edu.br",
    "password": "senhaSegura123",
    "isTeacher": true,
    "isRedator": true
  }
  ```
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "sucesso": true,
    "mensagem": "Usuário ID 1"
  }
  ```

---

### 2. Autenticação (Login)
- **Rota:** `POST /api/login`
- **Cabeçalho:** `Content-Type: application/json`
- **Corpo da Requisição (Body):**
  ```json
  {
    "email": "maria@ifpr.edu.br",
    "password": "senhaSegura123"
  }
  ```
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "sucesso": true,
    "mensagem": "Login realizado com sucesso!",
    "usuario": {
      "id": 1,
      "nome": "Maria Silva",
      "email": "maria@ifpr.edu.br",
      "isAdmin": 0,
      "isProfessor": 1,
      "isRedator": 1
    }
  }
  ```
- **Resposta de Erro (`401 Unauthorized`):**
  ```json
  {
    "sucesso": false,
    "mensagem": "E-mail ou senha incorretos."
  }
  ```

---

### 3. Consultar Perfil por ID
- **Rota:** `GET /api/usuario/:id`
- **Exemplo:** `GET /api/usuario/1`
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "sucesso": true,
    "usuario": {
      "id": 1,
      "nome": "Maria Silva",
      "email": "maria@ifpr.edu.br",
      "isAdmin": 0,
      "isProfessor": 1,
      "isRedator": 1
    }
  }
  ```

---

### 4. Listar Todos os Usuários
- **Rota:** `GET /api/usuarios`
- **Resposta de Sucesso (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "username": "Maria Silva",
      "email": "maria@ifpr.edu.br",
      "PROFESSOR": 1,
      "REDATOR": 1
    }
  ]
  ```

---

## 🔒 Controle de Acesso e Permissões (RBAC)

| Papel | Visualização do Catálogo | Acesso a Detalhes e Carrossel | Inclusão de Amostras (`+ Adicionar`) | Gerenciamento de Usuários |
|---|:---:|:---:|:---:|:---:|
| **Visitante Anônimo** | ✅ | ✅ | ❌ | ❌ |
| **Usuário Comum** | ✅ | ✅ | ❌ | ❌ |
| **Professor** | ✅ | ✅ | ❌ | ❌ |
| **Redator** | ✅ | ✅ | ✅ | ❌ |
| **Administrador (ADMIN)** | ✅ | ✅ | ✅ | ✅ |

---

## 🗺️ Próximos Passos (Roadmap)

- [ ] **Autenticação com JWT (JSON Web Tokens):** Transição de identificador em `localStorage` para tokens assinados com expiração e cookies de transporte seguro (`HttpOnly`).
- [ ] **Catálogo Dinâmico Orientado a Banco:** Substituição das páginas estáticas `IndexPG*.html` por uma rota dinâmica `detalhes.html?id=X` consumindo tabela `items`.
- [ ] **Módulo de Upload de Fotos:** Integração de `multer` para permitir que redatores enviem fotografias diretamente pela interface de `adicionar.html`.
- [ ] **Filtros e Busca Textual:** Sistema de busca por nome mineralógico, dureza na escala Mohs, composição química ou classe de rocha (magmática, sedimentar, metamórfica).
- [ ] **Variáveis de Ambiente:** Externalização de senhas e parâmetros de conexão via biblioteca `dotenv` (`.env`).

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos e educacionais sob a licença **ISC**.

© 2026 Studio / Instituto Federal do Paraná (IFPR). Todos os direitos reservados.
