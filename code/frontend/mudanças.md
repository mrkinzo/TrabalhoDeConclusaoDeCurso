<h1>entrega do prazo 14/08/26.</h1>

- Tcc Rochas e minerais.
-front feito com interação entre os  cards e  redirecionamento entre as paginas;
- principio do DB implementado.
- Não foi implementado back-end e nem o JS;
-não foi feita a parte do login e registo de usuário.
- o site apenas contem informações placeholder, aguardando mudancas futuras 

<h1>commit 27/08/26</h1>

- foram implementados:

- server. js 
- script.js 
- auth.js
- usuário

<h2>server.js:</h2>

    O servivdor faz a ligação entre o front-end e o banco de dados por meio de um JSON

<h2>auth.js</h2>
    Verifica em todas as páginas as permições do usuário, e verifica se este está logado, se não estiver, faz a injeção dos botões de login e registro, se o usuário estivar logado, injeta uma aba usuário (usuario.html), onde mostra as permições do usuário.


<h2>script.js</h2>
    Faz a comunicação entre o front e o servidor, onde envia os  dados do usuário para serem processados e guardados no DB. 