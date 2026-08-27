document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita recarregar a página

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginSenha').value;

    if (!email || !password) {
        alert('Por favor, preencha o e-mail e a senha.');
        return;
    }

    const loginBtn = event.target.querySelector('button[type="submit"]');
    loginBtn.disabled = true;
    loginBtn.innerText = 'Entrando...';

    // Envia os dados para a nossa nova rota do servidor
    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if(data.sucesso) {
            alert('Bem-vindo(a), ' + data.usuario.nome + '!');
            
            // Salva só o ID do usuário logado no localStorage do navegador.
            // Os outros dados (nome, cargos etc.) são sempre buscados
            // direto do banco quando a página precisar deles.
            localStorage.setItem('usuarioId', data.usuario.id);
            
            // Redireciona o usuário para a página Home do catálogo
            window.location.href = "IndexHome.html";
        } else {
            // Mostra o erro (ex: E-mail ou senha incorretos)
            alert(data.mensagem);
        }
    })
    .catch(erro => {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor.');
    })
    .finally(() => {
        loginBtn.disabled = false;
        loginBtn.innerText = 'Entrar';
    });
});