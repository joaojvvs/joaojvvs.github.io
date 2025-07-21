//função ajudantes
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  //funçãp ajudante fim
document.addEventListener('DOMContentLoaded', () => {
    
    let isDragging = false;

    function renderizarCarrossel() {
        if (typeof imoveisDB === 'undefined' || imoveisDB.length === 0) {
            console.error("Banco de dados 'imoveisDB' não encontrado ou vazio.");
            return;
        }
        
        const carrosselContainer = document.querySelector(".slider .list");
        if (!carrosselContainer) return;

        const imoveisEmbaralhados = embaralharArray([...imoveisDB]); 
        const imoveisDestaque = imoveisEmbaralhados.slice(0, 9);
        carrosselContainer.innerHTML = '';

        imoveisDestaque.forEach(imovel => {
            const precoFormatado = imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const enderecoCard = imovel.endereco.slice(1, 3).join(', ');

            const cardLink = document.createElement('a');
            cardLink.href = `/paginamodelo/imovel-detalhe.html?id=${imovel.id}`;
            cardLink.className = 'card-imovel';

            cardLink.innerHTML = `
                <img src="${imovel.imagens[0]}" alt="Foto de ${imovel.titulo}">
                <div class="card-info">
                    <h3 class="card-endereco">${enderecoCard}</h3>
                    <p class="card-preco">${precoFormatado}</p>
                    <div class="card-detalhes">
                        <span>${imovel.area} m²</span>
                        <span>${imovel.quartos} Quartos</span>
                        <span>${imovel.banheiros} Banhos</span>
                        <span>${imovel.vagas} Vaga(s)</span>
                    </div>
                </div>
            `;
            
            cardLink.addEventListener('click', (event) => {
                if (isDragging) {
                    event.preventDefault();
                }
            });

            carrosselContainer.appendChild(cardLink);
        });
    }

    function initSlider() {
        const imageList = document.querySelector(".slider .list");
        if (!imageList) return;
        
        const slideButtons = document.querySelectorAll(".slider .slide-button");

        slideButtons.forEach(button => {
            button.addEventListener("click", () => {
                const direction = button.id === "prev-slide" ? -1 : 1;
                imageList.scrollBy({ left: imageList.clientWidth * direction, behavior: "smooth" });
            });
        });

        let startX;
        
        const dragStart = (e) => {
            isDragging = false; 
            imageList.classList.add("dragging");
            startX = e.pageX;
        }

        const dragging = (e) => {
            if(!imageList.classList.contains("dragging")) return;
            isDragging = true; 
            const walk = (e.pageX - startX);
            imageList.scrollLeft = imageList.scrollLeft - walk;
        }

        const dragStop = () => {
            imageList.classList.remove("dragging");
        }

        imageList.addEventListener("mousedown", dragStart);
        imageList.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragStop);
        document.addEventListener("mouseleave", dragStop);
    }

    function initHomeSearch() {
        const tipoImovelInput = document.getElementById('tipo');
        const localImovelInput = document.getElementById('digiteonde');
        const buscarImoveis = () => {
            const tipo = tipoImovelInput.value;
            const local = localImovelInput.value;
            const urlDestino = `/imovel/imovel1.html?tipo=${encodeURIComponent(tipo)}&local=${encodeURIComponent(local)}`;
            window.location.href = urlDestino;
        };
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') buscarImoveis();
        };
        tipoImovelInput.addEventListener('keypress', handleKeyPress);
        localImovelInput.addEventListener('keypress', handleKeyPress);
    }

    function initCodigoSearch() {
        const codigoInput = document.getElementById('imov');
        const buscarPorCodigo = () => {
            const codigoId = parseInt(codigoInput.value);
            if (isNaN(codigoId)) {
                alert('Por favor, digite um código de imóvel válido.');
                return;
            }
            const imovelEncontrado = imoveisDB.find(imovel => imovel.id === codigoId);
            if (imovelEncontrado) {
                window.location.href = `/paginamodelo/imovel-detalhe.html?id=${imovelEncontrado.id}`;
            } else {
                alert('Imóvel com este código não encontrado.');
            }
        };
        codigoInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') buscarPorCodigo();
        });
    }

    renderizarCarrossel();
    initSlider();
    initHomeSearch();
    initCodigoSearch(); 
});