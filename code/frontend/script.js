class UserData {
    constructor(name, email, password, isTeacher, isRedator) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.isTeacher = isTeacher;
        this.isRedator = isRedator; 
    }
}

const registerForm = document.getElementById('registerForm');

if (registerForm) {
    const checkProfessor = document.getElementById('professor');
    const checkRedator = document.getElementById('redator');

    // Habilita a opção de Redator apenas se for professor (Heurística 5 - Prevenção de Erros)
    if (checkProfessor && checkRedator) {
        checkRedator.disabled = !checkProfessor.checked;
        checkProfessor.addEventListener('change', function () {
            checkRedator.disabled = !this.checked;
            if (!this.checked) {
                checkRedator.checked = false;
            }
        });
    }

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const name = document.getElementById('registroNome').value.trim();
        const email = document.getElementById('registroEmail').value.trim();
        const password = document.getElementById('registroSenha').value;
        
        const isTeacher = checkProfessor ? checkProfessor.checked : false;
        const isRedator = checkRedator ? checkRedator.checked : false;

        if (!name || !email || !password) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (!isTeacher && isRedator) {
            alert('Você precisa ser um professor para se registrar como redator.');
            return;
        }

        const userData = new UserData(name, email, password, isTeacher, isRedator);

        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Cadastrando...';

        // Dispara para a porta 3000 do servidor
        fetch('http://localhost:3000/api/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if(data.sucesso) {
                // Exibe a mensagem de retorno específica do backend (orientando se ficou pendente de aprovação)
                alert(data.mensagem);
                event.target.reset(); 
                window.location.href = "login.html";
            } else {
                alert('Erro ao cadastrar: ' + data.mensagem);
            }
        })
        .catch(erro => {
            console.error('Erro de conexão:', erro);
            alert('Não foi possível conectar ao servidor.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Criar conta';
        });
    });
}
 

export { UserData };