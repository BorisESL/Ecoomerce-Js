document.addEventListener('DOMContentLoaded', () => {
    const isHombrePage = document.querySelector('.titulo-principal').textContent.includes('HOMBRE');
    const isMujerPage = document.querySelector('.titulo-principal').textContent.includes('MUJER');

    const loadData = (url) => {
        return fetch(url)
            .then(response => response.json())
            .catch(error => console.error('Error:', error));
    };

    const dataUrl = isHombrePage ? "../dataHombre.json" : "../dataMujer.json";

    loadData(dataUrl)
        .then(data => {
            const productosContainer = document.querySelector('#productos');
            const categorias = ['zapatillas', 'poleras', 'shorts', 'faldas'];

            const productosData = isHombrePage ? data.hombre : (isMujerPage ? data.mujer : {});

            categorias.forEach(categoria => {
                const productos = productosData[categoria];
                if (productos && productos.length > 0) {
                    const categoriaHTML = `
                        <section class="categoria">
                            <h2>${categoria.toUpperCase()}</h2>
                            <div class="contenedor-productos">
                                ${productos.map(producto => `
                                    <div class="producto">
                                        <img class="producto-imagen" src="${producto.imagen}" alt="${producto.nombre}">
                                        <div class="producto-detalles">
                                            <h2 class="producto-nombre">${producto.nombre}</h2>
                                            <p>${producto.descripcion}</p>
                                            <p class="producto-valor">$${producto.precio.toLocaleString()}</p>
                                            <button class="producto-agregar" data-id="${producto.id}">Agregar</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    `;
                    productosContainer.innerHTML += categoriaHTML;
                }
            });
        });
});