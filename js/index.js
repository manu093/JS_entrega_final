/* ============================================================
   SISTEMA UNIFICADO DE PRODUCTOS + DETALLE + CARRITO
   ============================================================ */

   document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
    detectarPagina();
});

/*  CARGAR JSON UNA SOLA VEZ (CACHE) = */
let productosCache = null;

async function obtenerProductos() {
    if (productosCache) return productosCache;

    const res = await fetch("./data/productos.json");
    productosCache = await res.json();
    return productosCache;
}

/*   DETECTAR EN QUÉ PÁGINA ESTOY */
function detectarPagina() {
    const url = window.location.pathname;

    if (url.includes("index.html") || url.endsWith("/")) {
        cargarProductos();
    }

    if (url.includes("detalle.html")) {
        cargarDetalle();
    }

    if (url.includes("carrito.html")) {
        mostrarCarrito();
    }
}

/*  CARGAR PRODUCTOS (INDEX) */

async function cargarProductos() {
    const data = await obtenerProductos();
    const contenedor = document.querySelector("#productos-container");
    contenedor.innerHTML = "";

    data.forEach(prod => {
        contenedor.innerHTML += `
            <article class="producto">
                <h2>${prod.title}</h2>
                <img src="${prod.image}" alt="${prod.title}">
                <p>${prod.desc}</p>
                <h3>$${prod.price}</h3>

                <a href="./detalle.html?id=${prod.id}" class="info">Más info</a>

                <button class="compra" onclick="agregarAlCarrito(${prod.id})">
                    Comprar
                </button>
            </article>
        `;
    });
}

/*  AGREGAR AL CARRITO */
async function agregarAlCarrito(id) {
    const data = await obtenerProductos();
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const producto = data.find(p => p.id === id);
    const encontrado = carrito.find(item => item.id === id);

    if (encontrado) {
        encontrado.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            titulo: producto.title,
            precio: producto.price,
            imagen: producto.image,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();

    lanzarConfetiChocolate();
    mostrarToast(`"${producto.title}" agregado al carrito`);
}

/*  CONTADOR DEL CARRITO */

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const cartBtn = document.querySelector(".floating-cart");
    if (cartBtn) cartBtn.setAttribute("data-count", total);
}

/*  CARGAR DETALLE DEL PRODUCTO */
async function cargarDetalle() {
    const cont = document.querySelector("#detalle-container");
    if (!cont) return;

    const id = Number(new URLSearchParams(window.location.search).get("id"));
    const data = await obtenerProductos();

    const producto = data.find(p => p.id === id);

    cont.innerHTML = `
        <div class="detalle-card">
            <img src="${producto.image}">
            <div>
                <h2>${producto.title}</h2>
                <p>${producto.desc}</p>
                <h3>$${producto.price}</h3>

                <button onclick="agregarAlCarrito(${producto.id})" class="compra">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;
}

/*  MOSTRAR CARRITO COMPLETO  */
function mostrarCarrito() {
    const cont = document.querySelector("#carrito-container");
    const totalBox = document.querySelector(".carrito-total"); // CORREGIDO

    if (!cont) return;

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        cont.innerHTML = "<p>Carrito vacío.</p>";
        totalBox.textContent = "";
        return;
    }

    cont.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;

        cont.innerHTML += `
            <div class="carrito-item">

                <img src="${item.imagen}" alt="${item.titulo}">

                <h3>${item.titulo}</h3>

                <div class="carrito-precio">$${item.precio}</div>

                <div class="carrito-controles">
                    <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, -1)">−</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>

                <button class="carrito-eliminar" onclick="eliminar(${item.id})">🗑️</button>

            </div>
        `;
    });

    totalBox.textContent = `Total: $${total}`;
}

/* CAMBIAR CANTIDAD */

function cambiarCantidad(id, cambio) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const item = carrito.find(p => p.id === id);

    item.cantidad += cambio;
    if (item.cantidad <= 0) carrito = carrito.filter(p => p.id !== id);

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContadorCarrito();
}

/*  ELIMINAR PRODUCTO  */

function eliminar(id) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito = carrito.filter(item => item.id !== id);

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContadorCarrito();
}

/* CONFETI  */

function lanzarConfetiChocolate() {
    const cart = document.querySelector(".floating-cart");
    if (!cart) return;

    const rect = cart.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
        const confeti = document.createElement("div");
        confeti.classList.add("choco-confetti");

        const colores = ["#4e2e12", "#8b5a2b", "#d9c2a3", "#613318", "#c69c6d"];
        confeti.style.backgroundColor = colores[Math.random() * colores.length | 0];

        confeti.style.left = `${centerX}px`;
        confeti.style.top = `${centerY}px`;

        const angle = (Math.random() * 2 - 1) * 50;
        const distance = Math.random() * 80 + 40;

        confeti.style.transform = `translate(${angle}px, ${distance}px)`;

        document.body.appendChild(confeti);

        setTimeout(() => confeti.remove(), 1000);
    }
}

/*  TOAST */

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast-choco");
    toast.textContent = mensaje;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2000);
}
