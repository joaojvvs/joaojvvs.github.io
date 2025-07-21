const carregarComponente = async (url, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`Não foi possível carregar: ${url}`);
        const html = await resposta.text();
        placeholder.innerHTML = html;
    } catch (erro) {
        console.error('Erro ao carregar componente:', erro);
    }
};

function inicializarControlesPopup() {
    const linksContato = document.querySelectorAll('a[href="#contato"]');
    const popup = document.getElementById('popup-contato');
    const fecharPopupBtn = document.getElementById('fechar-popup');

    if (!popup) return; 

    const abrirPopup = () => popup.classList.add('ativo');
    const fecharPopup = () => popup.classList.remove('ativo');

    linksContato.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            abrirPopup();
        });
    });

    if (fecharPopupBtn) {
        fecharPopupBtn.addEventListener('click', fecharPopup);
    }
    
    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            fecharPopup();
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        carregarComponente('/aparte/rodape.html', 'rodape-placeholder'),
        carregarComponente('/aparte/popup-contato.html', 'popup-placeholder') // <<< ADICIONAMOS O CARREGAMENTO DO POP-UP
    ]);

    inicializarControlesPopup();
});