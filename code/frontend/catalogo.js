// =========================================================================
// catalogo.js - Carregamento Dinâmico de Amostras, Seleção no Catálogo (Editar/Remover)
// Studio - Acervo Virtual de Geociências (IFPR)
// =========================================================================

window.modoSelecaoAtual = null;
window.amostrasCatalogo = [];

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
            window.amostrasCatalogo = data.amostras;

            // Se o backend retornou as amostras cadastradas, substitui os cards estáticos para garantir IDs reais
            container.innerHTML = '';

            data.amostras.forEach(item => {
                const col = document.createElement('div');
                col.className = 'col-12 col-sm-6 col-lg-4 col-amostra';
                col.id = `card-amostra-${item.id}`;
                col.setAttribute('data-id', item.id);
                col.setAttribute('data-nome', item.nome);

                const badgeSecundaria = categoria === 'rocha' 
                    ? (item.tipo_rocha ? `<span class="badge bg-dark">${item.tipo_rocha}</span>` : '<span class="badge bg-dark">Rocha</span>')
                    : (item.grupo_mineral ? `<span class="badge bg-secondary">${item.grupo_mineral}</span>` : '<span class="badge bg-dark">Mineral</span>');

                const durezaTexto = item.dureza ? `<small class="text-muted ms-auto">Dureza: ${item.dureza}</small>` : '';

                col.innerHTML = `
                    <div class="card item-card h-100 shadow-sm position-relative" data-id="${item.id}" data-nome="${item.nome}">
                        <!-- Aba de Ações do Card -->
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

                        <a href="detalhes.html?id=${item.id}" class="text-decoration-none text-dark d-block h-100 card-link-principal">
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

                // Interceptador de clique quando estiver no Modo de Seleção (Editar ou Remover)
                col.querySelector('.item-card').addEventListener('click', function(e) {
                    if (window.modoSelecaoAtual === 'remover') {
                        e.preventDefault();
                        e.stopPropagation();
                        deletarAmostraDoCard(e, item.id, item.nome);
                    } else if (window.modoSelecaoAtual === 'editar') {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `editarAmostra.html?id=${item.id}`;
                    }
                });

                container.appendChild(col);
            });

            // Atualiza visibilidade das abas administrativas nos cards
            atualizarAbasNosCards();

            // Verifica se a página foi aberta com parâmetro de modo (?modo=remover ou ?modo=editar)
            const urlParams = new URLSearchParams(window.location.search);
            const modoUrl = urlParams.get('modo');
            if (modoUrl === 'remover' || modoUrl === 'editar') {
                ativarModoSelecaoCatalogo(modoUrl);
            }
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
            aba.classList.add('d-none');
        }
    });
}

/**
 * Ativa o modo interativo no catálogo para o usuário selecionar qual amostra deseja Editar ou Remover.
 * @param {'remover'|'editar'} modo
 */
function ativarModoSelecaoCatalogo(modo) {
    const user = window.usuarioLogado;

    if (modo === 'remover' && (!user || !user.isAdmin)) {
        alert('Acesso negado: Somente Administradores (ADM) têm permissão para remover amostras.');
        return;
    }

    if (modo === 'editar' && (!user || (!user.isAdmin && !user.isRedator))) {
        alert('Acesso negado: Você precisa ser Administrador ou Redator para editar amostras.');
        return;
    }

    cancelarModoSelecao(); // Limpa modo anterior se houver
    window.modoSelecaoAtual = modo;

    const workContainer = document.getElementById('work');
    if (!workContainer) return;

    // Adiciona classe visual nos cards
    if (modo === 'remover') {
        workContainer.classList.add('selection-mode-delete');
    } else {
        workContainer.classList.add('selection-mode-edit');
    }

    // Injeta banner de instrução no topo da página
    const banner = document.createElement('div');
    banner.id = 'bannerModoSelecao';
    banner.className = `selection-banner alert ${modo === 'remover' ? 'alert-danger' : 'alert-dark'} d-flex justify-content-between align-items-center`;
    
    banner.innerHTML = `
        <div class="fw-bold">
            ${modo === 'remover' 
                ? 'Modo de Remoção Ativo: Selecione no catálogo a amostra que deseja excluir.' 
                : 'Modo de Edição Ativo: Selecione no catálogo a amostra que deseja editar.'}
        </div>
        <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm ${modo === 'remover' ? 'btn-outline-danger bg-white' : 'btn-outline-light'}" onclick="abrirModalListaAmostras('${modo}')">
                Escolher por Lista
            </button>
            <button type="button" class="btn btn-sm ${modo === 'remover' ? 'btn-dark' : 'btn-light'}" onclick="cancelarModoSelecao()">
                Cancelar
            </button>
        </div>
    `;

    document.body.appendChild(banner);

    // Injeta badges em cada card indicando o clique
    document.querySelectorAll('#work .item-card').forEach(card => {
        const badge = document.createElement('span');
        badge.className = `card-selection-badge ${modo === 'remover' ? 'bg-danger text-white' : 'bg-primary text-white'}`;
        badge.innerText = modo === 'remover' ? 'Clique para Excluir' : 'Clique para Editar';
        card.appendChild(badge);
    });

    // Rola a tela suavemente para a grade de amostras
    workContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Cancela o modo de seleção interativa e restaura o catálogo normal.
 */
function cancelarModoSelecao() {
    window.modoSelecaoAtual = null;

    const banner = document.getElementById('bannerModoSelecao');
    if (banner) banner.remove();

    const workContainer = document.getElementById('work');
    if (workContainer) {
        workContainer.classList.remove('selection-mode-delete', 'selection-mode-edit');
    }

    document.querySelectorAll('.card-selection-badge').forEach(badge => badge.remove());
}

/**
 * Abre um modal com dropdown para o usuário selecionar uma amostra da lista caso prefira em vez de clicar no card.
 * @param {'remover'|'editar'} modo
 */
function abrirModalListaAmostras(modo) {
    const modalExistente = document.getElementById('modalListaAmostras');
    if (modalExistente) modalExistente.remove();

    if (!window.amostrasCatalogo || window.amostrasCatalogo.length === 0) {
        alert('Nenhuma amostra disponível no catálogo no momento.');
        return;
    }

    let optionsHtml = window.amostrasCatalogo.map(a => `<option value="${a.id}">${a.nome} (${a.categoria.toUpperCase()})</option>`).join('');

    const modalDiv = document.createElement('div');
    modalDiv.id = 'modalListaAmostras';
    modalDiv.className = 'modal fade show d-block';
    modalDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalDiv.tabIndex = -1;

    modalDiv.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">${modo === 'remover' ? 'Selecionar Amostra para Excluir' : 'Selecionar Amostra para Editar'}</h5>
                    <button type="button" class="btn-close" onclick="fecharModalListaAmostras()"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted small">
                        ${modo === 'remover' 
                            ? 'Escolha abaixo a amostra que deseja apagar permanentemente do banco de dados (exclusão em cascata):' 
                            : 'Escolha abaixo a amostra que deseja editar:'}
                    </p>
                    <div class="mb-3">
                        <label for="selectAmostraModal" class="form-label fw-semibold">Amostra do Catálogo</label>
                        <select id="selectAmostraModal" class="form-select form-select-lg">
                            ${optionsHtml}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" onclick="fecharModalListaAmostras()">Cancelar</button>
                    <button type="button" id="btnConfirmarAcaoModal" class="btn ${modo === 'remover' ? 'btn-danger' : 'btn-dark'} fw-bold px-4">
                        ${modo === 'remover' ? 'Excluir Amostra' : 'Editar Amostra'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalDiv);

    document.getElementById('btnConfirmarAcaoModal').addEventListener('click', () => {
        const select = document.getElementById('selectAmostraModal');
        const id = select.value;
        const nome = select.options[select.selectedIndex].text;

        fecharModalListaAmostras();

        if (modo === 'remover') {
            deletarAmostraDoCard(null, id, nome);
        } else {
            window.location.href = `editarAmostra.html?id=${id}`;
        }
    });
}

function fecharModalListaAmostras() {
    const modal = document.getElementById('modalListaAmostras');
    if (modal) modal.remove();
}

/**
 * Executa a exclusão de uma amostra com CASCADE.
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

    const confirmar = confirm(`EXCLUSÃO EM CASCATA (ADMINISTRADOR):\n\nTem certeza que deseja apagar permanentemente a amostra "${nome}" do acervo?\n\nEsta ação excluirá todos os dados e imagens vinculadas do banco de dados em CASCADE.`);
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
            
            // Remove o card visualmente
            const cardEl = document.getElementById(`card-amostra-${id}`);
            if (cardEl) {
                cardEl.style.transition = 'all 0.3s ease';
                cardEl.style.opacity = '0';
                cardEl.style.transform = 'scale(0.8)';
                setTimeout(() => cardEl.remove(), 300);
            }

            // Atualiza lista em memória
            window.amostrasCatalogo = window.amostrasCatalogo.filter(a => a.id != id);

            // Se estava em modo de seleção, cancela
            cancelarModoSelecao();
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
window.ativarModoSelecaoCatalogo = ativarModoSelecaoCatalogo;
window.cancelarModoSelecao = cancelarModoSelecao;
window.abrirModalListaAmostras = abrirModalListaAmostras;
window.fecharModalListaAmostras = fecharModalListaAmostras;
window.deletarAmostraDoCard = deletarAmostraDoCard;
