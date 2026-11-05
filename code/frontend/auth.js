// =========================================================================
// auth.js - Autenticação, Controle de Acesso (RBAC) e Injeção de Componentes
// Studio - Acervo Virtual de Geociências (IFPR)
// =========================================================================

document.addEventListener("DOMContentLoaded", async function () {
    const authMenu = document.getElementById('authMenu');

    const usuarioId = localStorage.getItem('usuarioId');
    let usuarioLogado = null;

    if (usuarioId) {
        try {
            const response = await fetch(`http://localhost:3000/api/usuario/${usuarioId}`);
            const data = await response.json();

            if (data.sucesso) {
                usuarioLogado = data.usuario;
            } else {
                // ID salvo não existe mais no banco
                localStorage.removeItem('usuarioId');
            }
        } catch (erro) {
            console.error('Erro ao buscar dados do usuário:', erro);
        }
    }

    // Disponibiliza o usuário globalmente para outros scripts (catálogo, cards, edição)
    window.usuarioLogado = usuarioLogado;
    window.dispatchEvent(new CustomEvent('authReady', { detail: usuarioLogado }));

    if (authMenu) {
        if (usuarioLogado) {
            // --- SE ESTIVER LOGADO (Injeta o menu de usuário e badges) ---
            let badgeCargo = '';

            if (usuarioLogado.isAdmin) {
                badgeCargo = '<span class="badge bg-danger ms-1" style="font-size: 0.7rem;">Admin</span>';
            } else if (usuarioLogado.isRedator) {
                badgeCargo = '<span class="badge bg-secondary ms-1" style="font-size: 0.7rem;">Redator</span>';
            } else if (usuarioLogado.isProfessor) {
                badgeCargo = '<span class="badge bg-primary ms-1" style="font-size: 0.7rem;">Professor</span>';
            }

            const nomeUsuario = usuarioLogado.nome || usuarioLogado.name || 'Usuário';

            authMenu.innerHTML = `
                <li class="nav-item ms-lg-3 dropdown">
                    <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span>Olá, <strong>${nomeUsuario}</strong></span> ${badgeCargo}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li><a class="dropdown-item" href="usuario.html"><i class="bi bi-person"></i> Meu Perfil</a></li>
                        ${(usuarioLogado.isAdmin || usuarioLogado.isRedator) ? `
                            <li><hr class="dropdown-divider"></li>
                            <li><h6 class="dropdown-header text-uppercase">Gerenciamento</h6></li>
                            <li><a class="dropdown-item" href="adicionarRocha.html">+ Adicionar Rocha</a></li>
                            <li><a class="dropdown-item" href="adicionarMineral.html">+ Adicionar Mineral</a></li>
                        ` : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="btnLogout">Sair da conta</a></li>
                    </ul>
                </li>
            `;

            // Evento para deslogar
            const btnLogout = document.getElementById('btnLogout');
            if (btnLogout) {
                btnLogout.addEventListener('click', function (e) {
                    e.preventDefault();
                    localStorage.removeItem('usuarioId');
                    alert('Você saiu da sua conta.');
                    window.location.href = "login.html";
                });
            }

        } else {
            // --- SE NÃO ESTIVER LOGADO (Injeta os botões de Login e Registrar) ---
            authMenu.innerHTML = `
                <li class="nav-item ms-lg-2"><a class="btn btn-outline-dark btn-sm px-3" href="login.html">Login</a></li>
                <li class="nav-item ms-lg-2"><a class="btn btn-dark btn-sm px-3" href="registro.html">Registrar</a></li>
            `;
        }
    }

    // Botão flutuante de adicionar amostra (para Administradores e Redatores)
    const paginaAtual = window.location.pathname;
    const paginasComBotao = ['index.html', 'indexMin.html', 'IndexHome.html'];
    const mostrarBotao = paginasComBotao.some(pagina => paginaAtual.endsWith(pagina));

    if (usuarioLogado && (usuarioLogado.isAdmin || usuarioLogado.isRedator) && mostrarBotao) {
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group dropup';
        btnGroup.style.position = 'fixed';
        btnGroup.style.bottom = '30px';
        btnGroup.style.right = '30px';
        btnGroup.style.zIndex = '1050';

        // Determina destino rápido conforme a página atual
        let linkPadrao = 'adicionar.html';
        if (paginaAtual.endsWith('index.html')) linkPadrao = 'adicionarRocha.html';
        if (paginaAtual.endsWith('indexMin.html')) linkPadrao = 'adicionarMineral.html';

        btnGroup.innerHTML = `
            <a href="${linkPadrao}" class="btn btn-dark shadow-lg px-3 py-2 fw-semibold">
                + Adicionar amostra
            </a>
            <button type="button" class="btn btn-dark dropdown-toggle dropdown-toggle-split shadow-lg" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="visually-hidden">Abrir menu</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
                <li><a class="dropdown-item py-2" href="adicionarRocha.html">Adicionar Rocha</a></li>
                <li><a class="dropdown-item py-2" href="adicionarMineral.html">Adicionar Mineral</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 text-muted" href="adicionar.html">Central de Adição</a></li>
            </ul>
        `;

        document.body.appendChild(btnGroup);
    }
});