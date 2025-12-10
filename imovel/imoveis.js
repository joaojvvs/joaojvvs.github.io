// --- FUNÇÕES AJUDANTES ---

function normalizarTexto(texto) {
    if (typeof texto !== 'string') return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
    if (!valor) {
        input.value = ''; // Corrigido erro de digitação (era input.valuer)
        return;
    }
    const valorNumerico = parseFloat(valor) / 100;
    const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    input.value = valorFormatado;
}

function desformatarMoeda(valorFormatado) {
    if (!valorFormatado || typeof valorFormatado !== 'string') return 0;
    let valorLimpo = valorFormatado.replace(/[^\d,]/g, '');
    valorLimpo = valorLimpo.replace(',', '.');
    return parseFloat(valorLimpo) || 0;
}

// --- LÓGICA PRINCIPAL ---

document.addEventListener('DOMContentLoaded', () => {
    // Seleção de Elementos
    const containerResultados = document.querySelector('.lista-imoveis');
    const containerPaginacao = document.querySelector('.paginacao'); // Novo seletor
    const botaoPesquisar = document.querySelector('.botao-pesquisar');
    
    // Filtros
    const filtroLocalizacao = document.querySelector('.painel-filtros input[placeholder="Digite o bairro ou cidade"]');
    const filtroTipo = document.querySelector('.painel-filtros input[placeholder="Ex: Apartamento, Casa"]');
    const filtroPrecoMin = document.querySelector('.filtro-preco input[placeholder="MÍN."]');
    const filtroPrecoMax = document.querySelector('.filtro-preco input[placeholder="MÁX."]');
    const filtroAreaMin = document.querySelector('.filtro-area input[placeholder="MÍN."]');
    const filtroAreaMax = document.querySelector('.filtro-area input[placeholder="MÁX."]');
    const grupoBotoesQuartos = document.querySelector('#filtro-quartos');
    const grupoBotoesBanheiros = document.querySelector('#filtro-banheiros');
    const filtroComodidades = document.querySelectorAll('.filtro-grupo-checkbox input[type="checkbox"]');

    // Toggle Filtros Mobile
    const toggleButton = document.getElementById('toggle-filtros');
    const filtrosAdicionais = document.getElementById('filtros-adicionais');

    if (toggleButton && filtrosAdicionais) {
        toggleButton.addEventListener('click', () => {
            filtrosAdicionais.classList.toggle('aberto');
            toggleButton.classList.toggle('ativo');
            const textoBotao = toggleButton.querySelector('span:first-child');
            if (filtrosAdicionais.classList.contains('aberto')) {
                textoBotao.textContent = 'Menos filtros';
            } else {
                textoBotao.textContent = 'Mais filtros';
            }
        });
    }

    // --- VARIÁVEIS DE CONTROLE DA PAGINAÇÃO ---
    let paginaAtual = 1;
    const itensPorPagina = 10;
    let resultadoFiltragemGlobal = []; // Guarda a lista completa filtrada

    // Função que desenha os cards na tela (apenas a fatia da página atual)
    function renderizarImoveis(listaDeImoveis) {
        containerResultados.innerHTML = '';
        
        if (listaDeImoveis.length === 0) {
            containerResultados.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum imóvel encontrado com estes critérios.</p>';
            containerPaginacao.innerHTML = ''; // Limpa paginação se não houver resultados
            return;
        }

        listaDeImoveis.forEach(imovel => {
            const precoFormatado = imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const enderecoFormatado = imovel.endereco.join(', ');
            // Proteção para caso não tenha imagem
            const imagemSrc = imovel.imagens && imovel.imagens.length > 0 ? imovel.imagens[0] : '/img/sem-foto.png';

            const cardHTML = `
                <a href="/paginamodelo/imovel-detalhe.html?id=${imovel.id}" class="card-imovel" target="_blank">
                    <img src="${imagemSrc}" alt="Foto de ${imovel.titulo}">
                    <div class="card-info">
                        <h2>${imovel.titulo}, ${imovel.area} m²</h2>
                        <p class="endereco">${enderecoFormatado}</p>
                        <div class="card-specs">
                            <span>${imovel.area} m²</span>
                            <span>${imovel.quartos} Quartos</span>
                            <span>${imovel.banheiros} Banhos</span>
                            <span>${imovel.vagas} Vagas</span>
                        </div>
                        <p class="preco">${precoFormatado}</p>
                        <div class="link-contato">Entre em contato</div>
                    </div>
                </a>`;
            containerResultados.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // Função que calcula qual fatia mostrar e desenha os botões de paginação
    function atualizarPagina() {
        // 1. Calcular índices de corte
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        
        // 2. Pegar a fatia da lista global
        const imoveisDaPagina = resultadoFiltragemGlobal.slice(inicio, fim);
        
        // 3. Renderizar os cards
        renderizarImoveis(imoveisDaPagina);

        // 4. Renderizar controles de paginação
        renderizarControlesPaginacao();
    }

    function renderizarControlesPaginacao() {
        containerPaginacao.innerHTML = '';
        const totalPaginas = Math.ceil(resultadoFiltragemGlobal.length / itensPorPagina);

        if (totalPaginas <= 1) return; // Não mostra paginação se só houver 1 página

        // Botão Anterior
        const btnAnterior = document.createElement('span');
        btnAnterior.textContent = '<<';
        if (paginaAtual === 1) {
            btnAnterior.style.opacity = '0.5';
            btnAnterior.style.pointerEvents = 'none';
        } else {
            btnAnterior.onclick = () => { paginaAtual--; atualizarPagina(); window.scrollTo(0,0); };
        }
        containerPaginacao.appendChild(btnAnterior);

        // Números das páginas (lógica simplificada)
        for (let i = 1; i <= totalPaginas; i++) {
            // Mostra apenas algumas páginas se houver muitas (opcional, aqui mostra todas)
            const btnNumero = document.createElement('span');
            btnNumero.textContent = i;
            if (i === paginaAtual) btnNumero.classList.add('ativo');
            
            btnNumero.onclick = () => {
                paginaAtual = i;
                atualizarPagina();
                window.scrollTo(0,0); // Rola para o topo ao mudar de página
            };
            containerPaginacao.appendChild(btnNumero);
        }

        // Botão Próximo
        const btnProximo = document.createElement('span');
        btnProximo.textContent = '>>';
        if (paginaAtual === totalPaginas) {
            btnProximo.style.opacity = '0.5';
            btnProximo.style.pointerEvents = 'none';
        } else {
            btnProximo.onclick = () => { paginaAtual++; atualizarPagina(); window.scrollTo(0,0); };
        }
        containerPaginacao.appendChild(btnProximo);
    }

    function aplicarFiltros() {
        const localizacaoInput = filtroLocalizacao.value;
        const tipoInput = filtroTipo.value;
        const precoMin = desformatarMoeda(filtroPrecoMin.value) || 0;
        const precoMax = desformatarMoeda(filtroPrecoMax.value) || Infinity;
        const areaMin = parseFloat(filtroAreaMin.value) || 0;
        const areaMax = parseFloat(filtroAreaMax.value) || Infinity;
        const quartosAtivo = grupoBotoesQuartos.querySelector('span.ativo');
        const numQuartos = quartosAtivo ? parseInt(quartosAtivo.textContent) : 0;
        const banheirosAtivo = grupoBotoesBanheiros.querySelector('span.ativo');
        const numBanheiros = banheirosAtivo ? parseInt(banheirosAtivo.textContent) : 0;
        const comodidadesSelecionadas = [...filtroComodidades].filter(c => c.checked).map(c => c.parentElement.textContent.trim());

        // Filtra a base de dados (imoveisDB)
        resultadoFiltragemGlobal = imoveisDB.filter(imovel => {
            if (localizacaoInput) {
                const termosDeBusca = normalizarTexto(localizacaoInput).split(' ').filter(termo => termo.length > 0);
                const enderecoCompletoNormalizado = normalizarTexto(imovel.endereco.join(' '));
                if (!termosDeBusca.every(termo => enderecoCompletoNormalizado.includes(termo))) return false;
            }
            if (tipoInput) {
                const tipoNormalizadoInput = normalizarTexto(tipoInput);
                const tipoEncontrado = imovel.tipo.some(tipoDoImovel => normalizarTexto(tipoDoImovel).includes(tipoNormalizadoInput));
                if (!tipoEncontrado) return false;
            }
            if (imovel.preco < precoMin || imovel.preco > precoMax) return false;
            if (imovel.area < areaMin || imovel.area > areaMax) return false;
            if (numQuartos > 0) {
                if (numQuartos >= 5) { if (imovel.quartos < 5) return false; }
                else { if (imovel.quartos !== numQuartos) return false; }
            }
            if (numBanheiros > 0) {
                if (numBanheiros >= 3) { if (imovel.banheiros < 3) return false; }
                else { if (imovel.banheiros !== numBanheiros) return false; }
            }
            if (comodidadesSelecionadas.length > 0) {
                const todasAsComodidadesExistem = comodidadesSelecionadas.every(comodidade => 
                    (imovel.comodidades && imovel.comodidades.includes(comodidade)) || (imovel.lazer && imovel.lazer.includes(comodidade))
                );
                if (!todasAsComodidadesExistem) return false;
            }
            return true;
        });

        // REINICIA A PAGINAÇÃO
        paginaAtual = 1; 
        atualizarPagina(); // Chama a função que corta a lista e exibe
    }

    function setupBotoesSelecao(grupoDeBotoes) {
        const botoes = grupoDeBotoes.querySelectorAll('span');
        botoes.forEach(botao => {
            botao.addEventListener('click', () => {
                const botaoAtivo = grupoDeBotoes.querySelector('.ativo');
                if (botaoAtivo === botao) {
                    botao.classList.remove('ativo');
                } else {
                    if (botaoAtivo) botaoAtivo.classList.remove('ativo');
                    botao.classList.add('ativo');
                }
                aplicarFiltros();
            });
        });
    }

    // Event Listeners
    filtroPrecoMin.addEventListener('input', () => formatarMoeda(filtroPrecoMin));
    filtroPrecoMax.addEventListener('input', () => formatarMoeda(filtroPrecoMax));

    botaoPesquisar.addEventListener('click', aplicarFiltros);
    [filtroLocalizacao, filtroTipo, filtroPrecoMin, filtroPrecoMax, filtroAreaMin, filtroAreaMax].forEach(input => {
        input.addEventListener('input', aplicarFiltros);
    });
    filtroComodidades.forEach(checkbox => checkbox.addEventListener('change', aplicarFiltros));
    
    setupBotoesSelecao(grupoBotoesQuartos);
    setupBotoesSelecao(grupoBotoesBanheiros);

    // Inicialização via URL ou Padrão
    const urlParams = new URLSearchParams(window.location.search);
    const tipoParam = urlParams.get('tipo');
    const localParam = urlParams.get('local');

    if (tipoParam || localParam) {
        if (tipoParam) filtroTipo.value = tipoParam;
        if (localParam) filtroLocalizacao.value = localParam;
        aplicarFiltros();
    } else {
        // Inicialização padrão
        resultadoFiltragemGlobal = imoveisDB; // Carrega tudo inicialmente
        paginaAtual = 1;
        atualizarPagina();
    }
});
