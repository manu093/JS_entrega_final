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
    if (url.includes("search-results.html")) {
        cargarResultados();
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
        cont.innerHTML = `<p class="carrito-total">Carrito vacío.</p>`;
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


/* ============================================================
   🔎 BUSCADOR — Mostrar resultados
   ============================================================ */
   function cargarResultados() {
    const cont = document.querySelector("#resultados-container");
    if (!cont) return; // No estoy en search-results.html

    const params = new URLSearchParams(window.location.search);
    const busqueda = params.get("buscar")?.toLowerCase() || "";

    fetch("./data/productos.json")
    .then(res => res.json())
    .then(data => {

        const resultados = data.filter(p =>
            p.title.toLowerCase().includes(busqueda) ||
            p.desc.toLowerCase().includes(busqueda)
        );

        if (resultados.length === 0) {
            cont.innerHTML = `<p>No hay resultados para "<strong>${busqueda}</strong>".</p>`;
            return;
        }

        cont.innerHTML = "";

        resultados.forEach(prod => {
            cont.innerHTML += `
                <article class="carrito-item">
                    <h2>${prod.title}</h2>
                    <img src="${prod.image}" alt="${prod.title}">
                    <p>${prod.desc}</p>
                    <h3>$${prod.price}</h3>

                    <a href="./detalle.html?id=${prod.id}" class="info">Más info</a>
                    <button class="compra" onclick="agregarAlCarrito(${prod.id})">Comprar</button>
                </article>
            `;
        });
    });
}


//  Logueo y register

/* ============================================================
   SISTEMA DE LOGIN / REGISTER (localStorage)
   ============================================================ */

/* ============= REGISTRAR ============= */
function registrarUsuario() {
    const nombre = document.getElementById("reg-nombre").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();

    if (!nombre || !email || !pass) {
        mostrarError("Todos los campos son obligatorios");
        return;
    }

    const usuario = { nombre, email, pass };

    // Guardamos usuario
    localStorage.setItem("usuario_registrado", JSON.stringify(usuario));

    mostrarExito("Cuenta creada ✔");

    setTimeout(() => {
        window.location.href = "./login.html";
    }, 1500);
}

/* ============= LOGIN ============= */
function loginUsuario() {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value.trim();

    const registrado = JSON.parse(localStorage.getItem("usuario_registrado"));

    if (!registrado) {
        mostrarError("No hay usuarios registrados.");
        return;
    }

    if (registrado.email !== email || registrado.pass !== pass) {
        mostrarError("Datos incorrectos ❌");
        return;
    }

    // Guardamos el usuario logueado
    localStorage.setItem("usuario_logueado", registrado.nombre);

    mostrarExito("Bienvenido/a " + registrado.nombre + " 🍫");

    setTimeout(() => {
        window.location.href = "./index.html";
    }, 1500);
}

/* ============= CERRAR SESIÓN ============= */
function logout() {
    localStorage.removeItem("usuario_logueado");
    window.location.href = "./index.html";
}

/* ============= Mostrar usuario en navbar ============= */
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("usuario_logueado");
    const userBox = document.getElementById("usuario-navbar");

    if (userBox) {
        if (user) {
            userBox.innerHTML = `
                <span class="nav-user">Hola, ${user} 🍫</span>
                <button onclick="logout()" class="logout-btn">Salir</button>
            `;
        } else {
            userBox.innerHTML = `
               <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <a href="./login.html" class="menus nav-link">
                    <i class="fa-solid fa-right-to-bracket"></i> Loguear
                </a>
                <a href="./register.html" class="menus nav-link">
                    <i class="fa-solid fa-user-plus"></i> Registrarse
                </a>
              </ul>
            `;
        }
    }
});


/* ============================================================
   TOASTS — errores y éxitos
   ============================================================ */

function mostrarError(msg) {
    showToast(msg, "error");
}

function mostrarExito(msg) {
    showToast(msg, "ok");
}

function showToast(msg, tipo) {
    const toast = document.createElement("div");

    toast.className = "toast-auth " + tipo;
    toast.textContent = msg;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}


document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
    detectarPagina();
    actualizarNavbarUsuario();
});

/* ============================================================
   🟣 CONTROL DEL LOGIN / ESTADO DEL USUARIO
   ============================================================ */
function actualizarNavbarUsuario() {
    const user = JSON.parse(localStorage.getItem("usuario"));
    const div = document.getElementById("usuario-navbar");

    const loginLink = document.getElementById("nav-login");
    const registerLink = document.getElementById("nav-register");

    if (!div) return;

    if (user) {
        // Ocultar login y registro
        loginLink.style.display = "none";
        registerLink.style.display = "none";

        // Mostrar usuario y logout
        div.innerHTML = `
            <span class="navbar-usuario">
                <i class="fa-solid fa-user"></i> Hola, ${user.nombre}
            </span>
            <button class="btn btn-sm btn-outline-light ms-3" onclick="cerrarSesion()">
                Cerrar sesión
            </button>
        `;
    } else {
        // Mostrar login/registro
        loginLink.style.display = "block";
        registerLink.style.display = "block";
        div.innerHTML = ""; // No mostrar nada más
    }
}

function cerrarSesion() {
    localStorage.removeItem("usuario");
    location.reload(); // refresca la página
}

document.addEventListener("DOMContentLoaded", () => {
    incluirPartes();
});

function incluirPartes() {
    document.querySelectorAll("[data-include]").forEach(async el => {
        const archivo = `./componentes/${el.getAttribute("data-include")}.html`;

        try {
            const respuesta = await fetch(archivo);
            el.innerHTML = await respuesta.text();
        } catch (err) {
            el.innerHTML = "<p>Error al cargar componente</p>";
        }
    });
}
