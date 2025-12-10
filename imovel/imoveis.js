
//function ajudantes 
function normalizarTexto(texto) {
    if (typeof texto !== 'string') return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function formatarMoeda(input){
    let valor = input.value.replace(/\D/g, '');
    if (!valor){
        input.value ='';
        return
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

//fim daas functions ajudantes
document.addEventListener('DOMContentLoaded', () => {

    const containerResultados = document.querySelector('.lista-imoveis');
    const botaoPesquisar = document.querySelector('.botao-pesquisar');
    const filtroLocalizacao = document.querySelector('.painel-filtros input[placeholder="Digite o bairro ou cidade"]');
    const filtroTipo = document.querySelector('.painel-filtros input[placeholder="Ex: Apartamento, Casa"]');
    const filtroPrecoMin = document.querySelector('.filtro-preco input[placeholder="MÍN."]');
    const filtroPrecoMax = document.querySelector('.filtro-preco input[placeholder="MÁX."]');
    const filtroAreaMin = document.querySelector('.filtro-area input[placeholder="MÍN."]');
    const filtroAreaMax = document.querySelector('.filtro-area input[placeholder="MÁX."]');
    const grupoBotoesQuartos = document.querySelector('#filtro-quartos');
    const grupoBotoesBanheiros = document.querySelector('#filtro-banheiros');
    const filtroComodidades = document.querySelectorAll('.filtro-grupo-checkbox input[type="checkbox"]');

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
    function renderizarImoveis(listaDeImoveis) {
        containerResultados.innerHTML = '';
        if (listaDeImoveis.length === 0) {
            containerResultados.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum imóvel encontrado com estes critérios.</p>';
            return;
        }
        listaDeImoveis.forEach(imovel => {
            const precoFormatado = imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const enderecoFormatado = imovel.endereco.join(', ');
            const cardHTML = `<a href="/paginamodelo/imovel-detalhe.html?id=${imovel.id}" class="card-imovel" target="_blank">
                                <img src="${imovel.imagens[0]}" alt="Foto de ${imovel.titulo}">
                                <div class="card-info"><h2>${imovel.titulo}, ${imovel.area} m²</h2>
                                     <p class="endereco">${enderecoFormatado}</p><div class="card-specs">
                                     <span>${imovel.area} m²</span><span>${imovel.quartos} Quartos</span>
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

    const imoveisFiltrados = imoveisDB.filter(imovel => {
        if (localizacaoInput) {
            const termosDeBusca = normalizarTexto(localizacaoInput).split(' ').filter(termo => termo.length > 0);
            const enderecoCompletoNormalizado = normalizarTexto(imovel.endereco.join(' '));
            
            const todosOsTermosEncontrados = termosDeBusca.every(termo => 
                enderecoCompletoNormalizado.includes(termo)
            );
            if (!todosOsTermosEncontrados) return false;
        }
        
if (tipoInput) {
    const tipoNormalizadoInput = normalizarTexto(tipoInput);
    const tipoEncontrado = imovel.tipo.some(tipoDoImovel =>
        normalizarTexto(tipoDoImovel).includes(tipoNormalizadoInput)
    );
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
    renderizarImoveis(imoveisFiltrados);
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

    filtroPrecoMin.addEventListener('input', () => formatarMoeda(filtroPrecoMin));
    filtroPrecoMax.addEventListener('input', () => formatarMoeda(filtroPrecoMax));

    botaoPesquisar.addEventListener('click', aplicarFiltros);
    [filtroLocalizacao, filtroTipo, filtroPrecoMin, filtroPrecoMax, filtroAreaMin, filtroAreaMax].forEach(input => {
        input.addEventListener('input', aplicarFiltros);
    });
    filtroComodidades.forEach(checkbox => checkbox.addEventListener('change', aplicarFiltros));
    
    setupBotoesSelecao(grupoBotoesQuartos);
    setupBotoesSelecao(grupoBotoesBanheiros);

    const urlParams = new URLSearchParams(window.location.search);
    const tipoParam = urlParams.get('tipo');
    const localParam = urlParams.get('local');

    if (tipoParam || localParam) {
        if (tipoParam) filtroTipo.value = tipoParam;
        if (localParam) filtroLocalizacao.value = localParam;
        aplicarFiltros();
    } else {
        renderizarImoveis(imoveisDB);
    }
});
