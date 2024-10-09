// main.js
let productosData = [];

document.addEventListener('DOMContentLoaded', () => {
    const isHombrePage = document.querySelector('.titulo-principal')?.textContent.includes('HOMBRE');
    const isMujerPage = document.querySelector('.titulo-principal')?.textContent.includes('MUJER');
    const isCarritoPage = document.querySelector('.titulo-principal')?.textContent.includes('Carrito');

    if (isHombrePage || isMujerPage) {
        cargarProductos();
    } else if (isCarritoPage) {
        cargarProductosCarrito();
    }

    // Solo actualiza el número del carrito si el elemento existe
    if (document.querySelector('#numero-carrito')) {
        actualizarNumeroCarrito();
    }
});
function cargarProductos() {
    const isHombrePage = document.querySelector('.titulo-principal').textContent.includes('HOMBRE');
    const dataUrl = isHombrePage ? "../dataHombre.json" : "../dataMujer.json";

    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            productosData = isHombrePage ? data.hombre : data.mujer;
            mostrarProductos();
        })
        .catch(error => console.error('Error:', error));
}

function mostrarProductos() {
    const contenedorProductos = document.querySelector('#productos-container');
    contenedorProductos.innerHTML = '';

    Object.keys(productosData).forEach(categoria => {
        const productos = productosData[categoria];
        const seccionCategoria = document.createElement('section');
        seccionCategoria.classList.add('categoria');
        seccionCategoria.id = categoria;

        const tituloCategoria = document.createElement('h2');
        tituloCategoria.textContent = categoria.toUpperCase();
        seccionCategoria.appendChild(tituloCategoria);

        const contenedorProductosCategoria = document.createElement('div');
        contenedorProductosCategoria.classList.add('contenedor-productos');

        productos.forEach(producto => {
            const divProducto = document.createElement('div');
            divProducto.classList.add('producto');
            divProducto.innerHTML = `
                <img class="producto-imagen" src="${producto.imagen}" alt="${producto.nombre}">
                <div class="producto-detalles">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p class="producto-valor">$${producto.precio.toLocaleString()}</p>
                    <button class="producto-agregar" data-id="${producto.id}">Agregar</button>
                </div>
            `;
            contenedorProductosCategoria.appendChild(divProducto);
        });

        seccionCategoria.appendChild(contenedorProductosCategoria);
        contenedorProductos.appendChild(seccionCategoria);
    });

    const botonesAgregar = document.querySelectorAll('.producto-agregar');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });

    mostrarCategoria('zapatillas');
}

function mostrarCategoria(categoriaId) {
    const secciones = document.querySelectorAll('.categoria');
    secciones.forEach(seccion => {
        if (seccion.id === categoriaId) {
            seccion.classList.add('active');
        } else {
            seccion.classList.remove('active');
        }
    });

    const botones = document.querySelectorAll('.boton-categoria');
    botones.forEach(boton => {
        if (boton.getAttribute('data-categoria') === categoriaId) {
            boton.classList.add('active');
        } else {
            boton.classList.remove('active');
        }
    });
}

function agregarAlCarrito(e) {
    const idProducto = e.target.getAttribute('data-id');
    const productoSeleccionado = encontrarProducto(idProducto);

    if (productoSeleccionado) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const index = carrito.findIndex(item => item.id === idProducto);

        if (index !== -1) {
            carrito[index].cantidad++;
        } else {
            productoSeleccionado.cantidad = 1;
            carrito.push(productoSeleccionado);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Solo actualiza el número del carrito si el elemento existe
        if (document.querySelector('#numero-carrito')) {
            actualizarNumeroCarrito();
        }
        
        // Mostrar notificación Toastify
        Toastify({
            text: `${productoSeleccionado.nombre} añadido al carrito (Total: ${carrito.reduce((sum, item) => sum + item.cantidad, 0)})`,
            duration: 2000,
            close: true,
            gravity: "top", 
            position: "right", 
            stopOnFocus: true, 
            style: {
                background: "linear-gradient(to right, #00b09b, green)",
                color: "white",
                borderRadius: "10px", 
            padding: "10px 20px",
            },
            onClick: function(){} // Callback after click
        }).showToast();

        console.log('Producto agregado al carrito:', productoSeleccionado.nombre);
    } else {
        console.error('Producto no encontrado');
    }
}

function encontrarProducto(id) {
    for (const categoria in productosData) {
        const producto = productosData[categoria].find(p => p.id === id);
        if (producto) return producto;
    }
    return null;
}

function actualizarNumeroCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const numeroCarrito = document.querySelector('#numero-carrito');
    if (numeroCarrito) {
        numeroCarrito.textContent = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    } else {
        console.warn('Elemento #numero-carrito no encontrado en el DOM');
    }
}

// Funciones para la página del carrito
function cargarProductosCarrito() {
    const contenedorCarrito = document.querySelector("#contenedor-carrito");
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length > 0) {
        contenedorCarrito.innerHTML = "";

        carrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.nombre}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.nombre}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" data-id="${producto.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

            contenedorCarrito.appendChild(div);
        });

    } else {
        contenedorCarrito.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
    }

    actualizarTotal();

    // Agregar event listeners para los botones de eliminar y vaciar
    const botonesEliminar = document.querySelectorAll('.carrito-producto-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', eliminarDelCarrito);
    });

    const botonVaciar = document.querySelector('#carrito-acciones-vaciar');
    if (botonVaciar) {
        botonVaciar.addEventListener('click', vaciarCarrito);
    }

    const botonComprar = document.querySelector('#carrito-acciones-comprar');
    if (botonComprar) {
        botonComprar.addEventListener('click', comprar);
    }
}

function eliminarDelCarrito(e) {
    const idProducto = e.target.closest('.carrito-producto-eliminar').getAttribute('data-id');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(producto => producto.id === idProducto);
    
    if (index !== -1) {
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
        } else {
            carrito.splice(index, 1);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        cargarProductosCarrito();
        actualizarNumeroCarrito();
    }
}

function vaciarCarrito() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "green",
        cancelButtonColor: "red",
        confirmButtonText: "Sí, vaciar carrito!",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('carrito', JSON.stringify([]));
            cargarProductosCarrito();
            actualizarNumeroCarrito();
            Swal.fire({
                title: "Carrito vaciado!",
                text: "Tu carrito ha sido vaciado.",
                icon: "success",
                confirmButtonColor: "green",
            });
        }
    });
}

function actualizarTotal() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalElement = document.querySelector("#total");
    const total = carrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    if (totalElement) {
        totalElement.innerText = `$${total.toLocaleString()}`;
    }
}

function comprar() {
    Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Compra realizada con éxito!",
        text: "Gracias por tu compra",
        showConfirmButton: false,
        timer: 1500,
        background: '#f0f0f0',
        iconColor: '#4CAF50'
    }).then(() => {
        // Acciones después de que se cierre la alerta
        localStorage.setItem('carrito', JSON.stringify([]));
        const contenedorCarrito = document.querySelector("#contenedor-carrito");
        contenedorCarrito.innerHTML = '<p class="compra-exitosa">¡Gracias por tu compra!</p>';
        actualizarNumeroCarrito();
        actualizarTotal();
    });
}

// Agregar event listeners para los botones de categoría
const botonesCategorias = document.querySelectorAll('.boton-categoria');
botonesCategorias.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const categoriaSeleccionada = e.target.getAttribute('data-categoria');
        mostrarCategoria(categoriaSeleccionada);
    });
});