// =========================================================================
// catalogo.js - Carregamento Dinâmico de Amostras, Abas nos Cards e Deleção
// Studio - Acervo Virtual de Geociências (IFPR)
// =========================================================================

/**
 * Carrega as amostras cadastradas no banco de dados e as insere na grade do catálogo.
 * @param {'rocha'|'mineral'} categoria 
 */
async function carregarCatalogoDinamico(categoria) {
    const container = document.getElementById('work');
    if (!container) return;

    try {
        const response = await fetch(`http://localhost:3000/api/amostras?categoria=${categoria}`);
        const data = await response.json();

        if (data.sucesso && Array.isArray(data.amostras) && data.amostras.length > 0) {
            // Renderiza cada amostra adicionada
            data.amostras.forEach(item => {
                // Evita duplicar se já foi inserido
                if (document.getElementById(`card-amostra-${item.id}`)) return;

                const col = document.createElement('div');
                col.className = 'col-12 col-sm-6 col-lg-4';
                col.id = `card-amostra-${item.id}`;

                const badgeSecundaria = categoria === 'rocha' 
                    ? (item.tipo_rocha ? `<span class="badge bg-dark">${item.tipo_rocha}</span>` : '<span class="badge bg-dark">Rocha</span>')
                    : (item.grupo_mineral ? `<span class="badge bg-primary">${item.grupo_mineral}</span>` : '<span class="badge bg-dark">Mineral</span>');

                const durezaTexto = item.dureza ? `<small class="text-muted ms-auto">Dureza: ${item.dureza}</small>` : '';

                col.innerHTML = `
                    <div class="card item-card h-100 shadow-sm position-relative">
                        <!-- Aba de Ações do Card (Exibida dinamicamente para Admins e Redatores) -->
                        <div class="card-admin-tab d-none" data-amostra-id="${item.id}">
                            <a href="editarAmostra.html?id=${item.id}" class="btn btn-dark btn-sm" onclick="event.stopPropagation()" title="Editar esta amostra">
                                Editar
                            </a>
                            <button type="button" class="btn btn-danger btn-sm btn-deletar-card d-none" 
                                onclick="deletarAmostraDoCard(event, ${item.id}, '${item.nome.replace(/'/g, "\\'")}')" 
                                title="Excluir do acervo (Exclusivo Administrador)">
                                Excluir
                            </button>
                        </div>

                        <a href="detalhes.html?id=${item.id}" class="text-decoration-none text-dark d-block h-100">
                            <img src="${item.imagem1}" alt="Amostra de ${item.nome}" 
                                 class="card-img-top"
                                 style="height: 200px; object-fit: cover;"
                                 onerror="this.src='https://via.placeholder.com/400x200?text=Sem+Imagem'">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2">
                                    ${badgeSecundaria}
                                    ${durezaTexto}
                                </div>
                                <h5 class="card-title fw-bold text-truncate">${item.nome}</h5>
                                <p class="card-text text-muted" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${item.descricao || 'Amostra geológica catalogada no acervo virtual do IFPR.'}
                                </p>
                            </div>
                        </a>
                    </div>
                `;

                // Insere as amostras cadastradas no início do catálogo
                container.prepend(col);
            });

            // Atualiza visibilidade das abas administrativas nos cards
            atualizarAbasNosCards();
        }
    } catch (err) {
        console.warn('Aviso: Não foi possível carregar amostras adicionais do servidor:', err.message);
    }
}

/**
 * Controla a visibilidade da aba de edição e exclusão nos cards conforme o papel do usuário.
 */
function atualizarAbasNosCards() {
    const user = window.usuarioLogado;
    const abas = document.querySelectorAll('.card-admin-tab');

    abas.forEach(aba => {
        if (user && (user.isAdmin || user.isRedator)) {
            aba.classList.remove('d-none'); // Admins e Redatores veem a aba e o botão Editar

            const btnDeletar = aba.querySelector('.btn-deletar-card');
            if (btnDeletar) {
                if (user.isAdmin) {
                    btnDeletar.classList.remove('d-none'); // SOMENTE Administradores veem o botão Excluir
                } else {
                    btnDeletar.classList.add('d-none'); // Redatores NÃO veem exclusão
                }
            }
        } else {
            aba.classList.add('d-none'); // Usuários comuns ou deslogados não veem a aba
        }
    });
}

/**
 * Executa a exclusão de uma amostra com CASCADE a partir do clique no botão da aba do card.
 */
async function deletarAmostraDoCard(event, id, nome) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const user = window.usuarioLogado;
    if (!user || !user.isAdmin) {
        alert('Acesso negado: Somente Administradores (ADM) podem apagar amostras.');
        return;
    }

    const confirmar = confirm(`EXCLUSÃO EM CASCATA:\n\nTem certeza que deseja apagar permanentemente a amostra "${nome}" do acervo?\n\nEsta ação excluirá os dados e todas as imagens vinculadas do banco de dados em CASCADE.`);
    if (!confirmar) return;

    try {
        const response = await fetch(`http://localhost:3000/api/amostras/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuarioId: user.id })
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(`Amostra "${nome}" excluída com sucesso em cascata!`);
            const cardEl = document.getElementById(`card-amostra-${id}`);
            if (cardEl) {
                cardEl.style.transition = 'all 0.3s ease';
                cardEl.style.opacity = '0';
                cardEl.style.transform = 'scale(0.9)';
                setTimeout(() => cardEl.remove(), 300);
            }
        } else {
            alert('Erro ao excluir: ' + data.mensagem);
        }
    } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Não foi possível conectar ao servidor para excluir a amostra.');
    }
}

// Ouvintes de eventos
window.addEventListener('authReady', () => {
    atualizarAbasNosCards();
});

window.carregarCatalogoDinamico = carregarCatalogoDinamico;
window.atualizarAbasNosCards = atualizarAbasNosCards;
window.deletarAmostraDoCard = deletarAmostraDoCard;
