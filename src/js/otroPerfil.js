/* ====== OTRO PERFIL ====== */

// Botón "añadir a favoritos"
const btnAnadirPerfilFav = document.querySelector(".anadirPerfilFav");

// Elementos donde pintas info del perfil (AJUSTA a tu HTML)
const elUsername = document.querySelector(".usernameOtroPerfil"); // si lo usas como título
const elNombreCompleto = document.querySelector(".nombreCompletoOtroPerfil"); // ejemplo
const ulJuegos = document.getElementById("listaJuegosOtroPerfil"); // ejemplo <ul>

// ---------- Helpers base (si ya los tienes en otro archivo, puedes borrar estos) ----------
function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

function getSession() {
    try { return JSON.parse(localStorage.getItem("session")); }
    catch { return null; }
}

function loadUsers() {
    return load("users", []);
}

function normalizeUsername(u) {
    return String(u || "").trim().toLowerCase();
}

// ---------- Favoritos (por usuario logueado) ----------
function getFavKey() {
    const session = getSession();
    const me = normalizeUsername(session?.username);
    if (!me) return null;
    return `favoritos_${me}`; // guardamos la key también normalizada
}

function loadFavoritos() {
    const key = getFavKey();
    if (!key) return null;
    return load(key, []);
}

function saveFavoritos(favoritos) {
    const key = getFavKey();
    if (!key) return false;
    localStorage.setItem(key, JSON.stringify(favoritos));
    return true;
}

function actualizarEstadoBoton(usernameOtroPerfilRaw) {
    if (!btnAnadirPerfilFav) return;

    const session = getSession();
    const me = normalizeUsername(session?.username);
    const otro = normalizeUsername(usernameOtroPerfilRaw);

    // Si no hay sesión, el botón sigue visible pero fuerza login al click
    if (!otro) {
        btnAnadirPerfilFav.textContent = "AÑADIR PERFIL A FAVORITOS";
        btnAnadirPerfilFav.disabled = true;
        return;
    }

    // Si es tu propio perfil: deshabilita
    if (me && otro === me) {
        btnAnadirPerfilFav.textContent = "ESTE ES TU PERFIL";
        btnAnadirPerfilFav.disabled = true;
        btnAnadirPerfilFav.classList.remove("enFavoritos");
        return;
    }

    const favoritos = loadFavoritos() || [];
    const esta = favoritos.includes(otro);

    btnAnadirPerfilFav.textContent = esta ? "QUITAR DE FAVORITOS" : "AÑADIR PERFIL A FAVORITOS";
    btnAnadirPerfilFav.disabled = false;
    btnAnadirPerfilFav.classList.toggle("enFavoritos", esta);
}

function toggleFavorito(usernameOtroPerfilRaw) {
    const session = getSession();
    const me = normalizeUsername(session?.username);

    if (!me) {
        alert("Debes iniciar sesión para agregar perfiles a favoritos.");
        return;
    }

    const otro = normalizeUsername(usernameOtroPerfilRaw);
    if (!otro) {
        alert("No se pudo obtener el nombre de usuario del perfil.");
        return;
    }

    if (otro === me) {
        alert("No puedes agregar tu propio perfil a favoritos.");
        return;
    }

    // Validar que el perfil exista
    const users = loadUsers();
    const existe = users.some(u => normalizeUsername(u.username) === otro);
    if (!existe) {
        alert("El perfil que intentas agregar no existe.");
        return;
    }

    const favoritos = loadFavoritos();
    if (!favoritos) return;

    const idx = favoritos.indexOf(otro);
    if (idx >= 0) favoritos.splice(idx, 1);
    else favoritos.push(otro);

    saveFavoritos(favoritos);
    actualizarEstadoBoton(otro);
}

// ---------- Cargar perfil desde ?u= ----------
function getUsernameFromUrl() {
    const u = new URLSearchParams(location.search).get("u");
    return normalizeUsername(u);
}

function renderOtroPerfil(usernameOtroPerfil) {
    const users = loadUsers();
    const user = users.find(u => normalizeUsername(u.username) === usernameOtroPerfil);

    if (!user) {
        // pinta algo en pantalla si quieres
        if (elUsername) elUsername.textContent = "Perfil no encontrado";
        if (elNombreCompleto) elNombreCompleto.textContent = "";
        if (ulJuegos) ulJuegos.innerHTML = "";
        actualizarEstadoBoton(usernameOtroPerfil);
        return;
    }

    // Pinta datos
    if (elUsername) elUsername.textContent = user.username; // mantén el formato original si lo guardas así
    if (elNombreCompleto) elNombreCompleto.textContent = `${user.name ?? ""} ${user.apellidos ?? ""}`.trim();

    // Listar juegos del usuario
    const games = load("games", []);
    const misJuegos = games.filter(g => normalizeUsername(g.ownerUsername) === usernameOtroPerfil);

    if (ulJuegos) {
        ulJuegos.innerHTML = "";

        if (misJuegos.length === 0) {
            ulJuegos.innerHTML = `<li class="vacio">Este usuario no tiene juegos publicados.</li>`;
        } else {
            for (const g of misJuegos) {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;
                a.textContent = `${g.title} - ${g.platform} - ${g.condition}`;

                li.appendChild(a);
                ulJuegos.appendChild(li);
            }
        }
    }

    actualizarEstadoBoton(user.username);
}

// ---------- Eventos ----------
document.addEventListener("DOMContentLoaded", () => {
    const usernameOtroPerfil = getUsernameFromUrl();
    renderOtroPerfil(usernameOtroPerfil);

    btnAnadirPerfilFav?.addEventListener("click", (e) => {
        e.preventDefault();

        // Mejor: usar el username de la URL (es la fuente real)
        const u = getUsernameFromUrl();
        toggleFavorito(u);
    });
});
