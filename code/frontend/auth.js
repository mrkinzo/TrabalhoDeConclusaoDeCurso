document.addEventListener("DOMContentLoaded", async function() {
    const authMenu = document.getElementById('authMenu');
    
    if (!authMenu) {
        console.error("ERRO: O elemento com id 'authMenu' não foi encontrado no HTML desta página!");
        return;
    }

    const usuarioId = localStorage.getItem('usuarioId');
    let usuarioLogado = null;

    if (usuarioId) {
        try {
            const response = await fetch(`http://localhost:3000/api/usuario/${usuarioId}`);
            const data = await response.json();

            if (data.sucesso) {
                usuarioLogado = data.usuario;
            } else {
                // ID salvo não existe mais no banco (ex: usuário foi removido)
                localStorage.removeItem('usuarioId');
            }
        } catch (erro) {
            console.error('Erro ao buscar dados do usuário:', erro);
        }
    }

    if (usuarioLogado) {
        // --- SE ESTIVER LOGADO (Injeta o menu de usuário e cargos) ---
        let badgeCargo = '';
        
        if (usuarioLogado.isAdmin) {
            badgeCargo = '<span class="badge bg-danger ms-1" style="font-size: 0.7rem;">Admin</span>';
        } else if (usuarioLogado.isRedator) {
            badgeCargo = '<span class="badge bg-secondary ms-1" style="font-size: 0.7rem;">Redator</span>';
        }

        // Pega o nome do usuário suportando tanto 'nome' quanto 'name'
        const nomeUsuario = usuarioLogado.nome || usuarioLogado.name || 'Usuário';

        authMenu.innerHTML = `
            <li class="nav-item ms-lg-3 dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span>Olá, <strong>${nomeUsuario}</strong></span> ${badgeCargo}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="usuario.html">Meu Perfil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="btnLogout">Sair da conta</a></li>
                </ul>
            </li>
        `;

        // Evento para deslogar
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('usuarioId');
                alert('Você saiu da sua conta.');
                window.location.href = "login.html";
            });
        }

    } else {
        // --- SE NÃO ESTIVER LOGADO (Injeta os botões de Login e Registrar) ---
        authMenu.innerHTML = `
            <li class="nav-item ms-lg-2"><a class="btn btn-outline-dark btn-sm" href="login.html">Login</a></li>
            <li class="nav-item ms-lg-2"><a class="btn btn-dark btn-sm" href="registro.html">Registrar</a></li>
        `;
    }
});