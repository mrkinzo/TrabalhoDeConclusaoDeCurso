// =========================================================================
// picker.js - Gerenciador de Seletores (Pickers), Opções e Uploads de Imagens
// Studio - Acervo Virtual de Geociências (IFPR)
// =========================================================================

// Opções oficiais para Rochar e Minerais solicitadas nas especificações
const TIPOS_ROCHA = [
    { valor: 'Ignea', rotulo: 'Ígnea (Magmática)' },
    { valor: 'Sedimentar', rotulo: 'Sedimentar' },
    { valor: 'Metamorfica', rotulo: 'Metamórfica' }
];

const OPCOES_CLIVAGEM = [
    { valor: '1 direção', rotulo: '1 direção' },
    { valor: '2 direções', rotulo: '2 direções' },
    { valor: '3 direções', rotulo: '3 direções' },
    { valor: '4 direções', rotulo: '4 direções' },
    { valor: '6 direções', rotulo: '6 direções' },
    { valor: 'Fratura', rotulo: 'Fratura (sem clivagem preferencial)' }
];

const GRUPOS_MINERAIS = [
    'Elementos nativos',
    'Sulfetos',
    'Sulfossais',
    'Óxidos',
    'Haloides',
    'Carbonatos',
    'Nitratos',
    'Boratos',
    'Sulfatos e Cromatos',
    'Fosfatos, arseniatos e vanadatos',
    'Tungstatos e molibdatos',
    'Silicatos'
];

/**
 * Preenche um elemento <select> com um array de opções.
 * @param {HTMLSelectElement|string} selectElement Ou o elemento DOM ou o ID do select
 * @param {Array<string|{valor: string, rotulo: string}>} opcoes Lista de opções
 * @param {string} valorSelecionado Valor padrão pré-selecionado
 * @param {string} placeholder Texto da primeira opção desabilitada
 */
function popularPicker(selectElement, opcoes, valorSelecionado = '', placeholder = 'Selecione uma opção...') {
    const el = typeof selectElement === 'string' ? document.getElementById(selectElement) : selectElement;
    if (!el) return;

    el.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `-- ${placeholder} --`;
    defaultOption.disabled = true;
    if (!valorSelecionado) defaultOption.selected = true;
    el.appendChild(defaultOption);

    opcoes.forEach(op => {
        const option = document.createElement('option');
        if (typeof op === 'string') {
            option.value = op;
            option.textContent = op;
        } else {
            option.value = op.valor;
            option.textContent = op.rotulo;
        }

        if (valorSelecionado && option.value.toLowerCase() === valorSelecionado.toLowerCase()) {
            option.selected = true;
        }
        el.appendChild(option);
    });
}

/**
 * Converte um arquivo do tipo File (de um input type="file") para uma string Base64 DataURL.
 * @param {File} file 
 * @returns {Promise<string>}
 */
function arquivoParaBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Configura um preview interativo para um campo de upload de imagem.
 * @param {string} inputId ID do <input type="file">
 * @param {string} previewImgId ID da tag <img> de preview
 * @param {string} containerId ID do container da caixa de upload (opcional)
 */
function configurarPreviewImagem(inputId, previewImgId, containerId = null) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewImgId);
    if (!input || !preview) return;

    input.addEventListener('change', function () {
        const file = this.files && this.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG, WEBP).');
                this.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.classList.remove('d-none');
                if (containerId) {
                    const cont = document.getElementById(containerId);
                    if (cont) cont.classList.add('has-image');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Exporta para escopo global para uso em formulários inline e scripts modulares
window.TIPOS_ROCHA = TIPOS_ROCHA;
window.OPCOES_CLIVAGEM = OPCOES_CLIVAGEM;
window.GRUPOS_MINERAIS = GRUPOS_MINERAIS;
window.popularPicker = popularPicker;
window.arquivoParaBase64 = arquivoParaBase64;
window.configurarPreviewImagem = configurarPreviewImagem;
