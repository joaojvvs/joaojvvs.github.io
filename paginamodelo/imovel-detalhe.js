document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const imovelId = parseInt(urlParams.get('id'));

    if (!imovelId) {
        document.querySelector('main').innerHTML = '<h1 style="text-align:center;">Erro: Imóvel não especificado.</h1>';
        return;
    }

    const imovel = imoveisDB.find(item => item.id === imovelId);

    if (!imovel) {
        document.querySelector('main').innerHTML = `<h1 style="text-align:center;">Imóvel com código ${imovelId} não encontrado.</h1>`;
        return;
    }

    document.title = imovel.titulo;
    document.getElementById('breadcrumb').textContent = `${imovel.endereco.join(', ')} - Cód. ${imovel.id}`;

    const imagemDestaque = document.getElementById('imagem-destaque');
    const miniaturasContainer = document.getElementById('miniaturas-container');
    
    if (imovel.imagens && imovel.imagens.length > 0) {
        imagemDestaque.src = imovel.imagens[0];
        miniaturasContainer.innerHTML = '';
        
        imovel.imagens.forEach((imgSrc, index) => {
            const miniatura = document.createElement('img');
            miniatura.src = imgSrc;
            miniatura.alt = `Foto ${index + 1} de ${imovel.titulo}`;
            miniatura.classList.add('miniatura');
            if (index === 0) {
                miniatura.classList.add('ativa');
            }
            
            miniatura.addEventListener('click', function() {
                document.querySelector('.miniatura.ativa').classList.remove('ativa');
                this.classList.add('ativa');
                imagemDestaque.src = this.src;
            });

            miniaturasContainer.appendChild(miniatura);
        });
    }

    document.getElementById('imovel-titulo').textContent = imovel.titulo;
    document.getElementById('specs-principais').innerHTML = `
        <span>${imovel.area} m²</span>
        <span>${imovel.quartos} Quartos</span>
        <span>${imovel.banheiros} Banhos</span>
        <span>${imovel.vagas} Vaga(s)</span>
    `;

    document.getElementById('imovel-descricao').textContent = imovel.descricao || "Descrição detalhada não disponível.";

    function preencherLista(elementId, itens) {
        const listaElemento = document.getElementById(elementId);
        if (!listaElemento) return;

        if (itens && itens.length > 0) {
            listaElemento.innerHTML = '';
            itens.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                listaElemento.appendChild(li);
            });
        } else {
            listaElemento.parentElement.style.display = 'none';
        }
    }

    preencherLista('lista-topicos', imovel.topicos);
    preencherLista('lista-comodidades', imovel.comodidades);
    preencherLista('lista-lazer', imovel.lazer);

    document.getElementById('imovel-preco').textContent = imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('imovel-financiamento').textContent = imovel.financiamento || 'Consultar';
    document.getElementById('imovel-area-total').textContent = `${imovel.area} m²`;

    const condominioValor = imovel.condominio ? imovel.condominio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado';
    document.getElementById('imovel-condominio').textContent = condominioValor;
    
    const iptuValor = imovel.iptu ? imovel.iptu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado';
    document.getElementById('imovel-iptu').textContent = iptuValor;   
     document.getElementById('imovel-preco2').textContent = imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

});