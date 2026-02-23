const eliminarJuegosFav = document.getElementById("btn_eliminarJuegosFav");
const eliminarPerfilesFav = document.getElementById("btn_eliminarPerfilesFav");

eliminarJuegosFav?.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres eliminar los juegos seleccionados de tus juegos favoritos?")) {
        alert("Juegos favoritos eliminados. (Pendiente lógica)");
    }
});

eliminarPerfilesFav?.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres eliminar los perfiles seleccionados de tus perfiles favoritos?")) {
        alert("Perfiles favoritos eliminados. (Pendiente lógica)");
    }
});

function normalizeUsername(x) {
    return String(x || "").trim().toLowerCase();
}

function getFavProfileUsernames(arr) {
    // soporta ["carlosg", ...] o [{username:"carlosg"}, ...]
    return (arr || [])
        .map(p => (typeof p === "string" ? p : p?.username))
        .map(normalizeUsername)
        .filter(Boolean);
}

function getFavGameIds(arr) {
    // soporta ["id1", ...] o [{id:"id1"}, ...]
    return (arr || [])
        .map(g => (typeof g === "string" ? g : g?.id))
        .map(id => String(id || "").trim())
        .filter(Boolean);
}

function renderFavoritos() {
    const ulJuegosFav = document.getElementById("listaJuegosFav");
    const ulPerfilesFav = document.getElementById("listaPerfilesFav");
    if (!ulJuegosFav || !ulPerfilesFav) return;

    const session = getSession();
    const myUsername = normalizeUsername(session?.username);

    // Si no hay sesión, no podemos saber qué key leer
    if (!myUsername) {
        ulJuegosFav.innerHTML = "<li>Inicia sesión para ver tus favoritos.</li>";
        ulPerfilesFav.innerHTML = "<li>Inicia sesión para ver tus favoritos.</li>";
        return;
    }

    const juegosFavoritosRaw = load("likes_games_" + myUsername, []);
    const perfilesFavoritosRaw = load("favoritos_" + myUsername, []);

    // “Tablas maestras”
    const games = load("games", []);
    const users = load("users", []);

    // Resolver favoritos
    const favGameIds = getFavGameIds(juegosFavoritosRaw);
    const favProfileUsernames = getFavProfileUsernames(perfilesFavoritosRaw);

    const favGames = favGameIds
        .map(id => games.find(g => String(g.id) === String(id)))
        .filter(Boolean);

    const favUsers = favProfileUsernames
        .map(u => users.find(x => normalizeUsername(x.username) === u))
        .filter(Boolean);

    // Render Juegos Favoritos
    ulJuegosFav.innerHTML = "";
    if (!favGames.length) {
        ulJuegosFav.innerHTML = `<li>No tienes juegos favoritos aún.</li>`;
    } else {
        favGames
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .forEach(g => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;
                a.textContent = `${g.title} - ${g.platform} - ${g.condition} - ${g.ownerUsername}`;
                li.appendChild(a);
                ulJuegosFav.appendChild(li);
            });
    }

    // Render Perfiles Favoritos
    ulPerfilesFav.innerHTML = "";
    if (!favUsers.length) {
        ulPerfilesFav.innerHTML = `<li>No tienes perfiles favoritos aún.</li>`;
    } else {
        favUsers.forEach(u => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `otroPerfil.html?u=${encodeURIComponent(u.username)}`;
            // si no tienes "name", usa username
            a.textContent = u.username ? `${u.name} (${u.username})` : `${u.username}`;
            li.appendChild(a);
            ulPerfilesFav.appendChild(li);
        });
    }
}

document.addEventListener("DOMContentLoaded", renderFavoritos);