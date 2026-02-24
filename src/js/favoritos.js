const eliminarJuegosFav = document.getElementById("btn_eliminarJuegosFav");
const eliminarPerfilesFav = document.getElementById("btn_eliminarPerfilesFav");
const eliminarTodoJuegosFav = document.getElementById("btn_eliminarTodoJuegosFav");
const eliminarTodoPerfilesFav = document.getElementById("btn_eliminarTodoPerfilesFav");
const cancelarJuegosFav = document.getElementById("btn_cancelarJuegosFav");
const cancelarPerfilesFav = document.getElementById("btn_cancelarPerfilesFav");
let modoEliminarJuegos = false;
let modoEliminarPerfiles = false;

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

function activarModoEliminarJuegos({ botonId, listaId, storageKey }) {
    console.log("Etramos en modo eliminar juegos favoritos con:", { botonId, listaId, storageKey });
    const btn = document.getElementById(botonId);
    const ul = document.getElementById(listaId);
    if (!btn || !ul) return;

    const items = ul.querySelectorAll("li");

    if (!modoEliminarJuegos) {
        modoEliminarJuegos = true;
        btn.textContent = "ELIMINAR SELECCIONADOS";
        eliminarTodoJuegosFav.style.display = "";
        cancelarJuegosFav.style.display = "";

        items.forEach(li => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList = "checkboxEliminarJuegos";
            li.prepend(checkbox);
        });
        console.log("Modo eliminar juegos activado con checkboxes añadidos.");
    } else {
        const seleccionados = ul.querySelectorAll(".checkboxEliminarJuegos:checked");

        const idsJuegosAEliminar = [...seleccionados]
            .map(cb => cb.closest("li")?.dataset.id)
            .filter(Boolean);

        if (idsJuegosAEliminar.length === 0) {
            alert("Selecciona al menos un juego para eliminar.");
            return;
        }

        let data = getFavGameIds(load(storageKey, [])); // ✅ array de ids (strings)
        data = data.filter(id => !idsJuegosAEliminar.includes(String(id)));

        save(storageKey, data);

        btn.textContent = "ELIMINAR JUEGO";
        eliminarTodoJuegosFav.style.display = "none";
        cancelarJuegosFav.style.display = "none";

        console.log("Juegos eliminados:", idsJuegosAEliminar);
        modoEliminarJuegos = false;
        renderFavoritos();
    }
}

function activarModoEliminarPerfiles({ botonId, listaId, storageKey }) {
    const btn = document.getElementById(botonId);
    const ul = document.getElementById(listaId);
    if (!btn || !ul) return;

    const items = ul.querySelectorAll("li");

    if (!modoEliminarPerfiles) {
        modoEliminarPerfiles = true;

        btn.textContent = "ELIMINAR SELECCIONADOS";
        eliminarTodoPerfilesFav.style.display = "";
        cancelarPerfilesFav.style.display = "";

        items.forEach(li => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList = "checkboxEliminarPerfiles";
            li.prepend(checkbox);
        });
    } else {
        const perfilesSeleccionados = ul.querySelectorAll(".checkboxEliminarPerfiles:checked");

        const perfilesAEliminar = [...perfilesSeleccionados]
            .map(cb => cb.closest("li")?.dataset.username)
            .map(normalizeUsername)
            .filter(Boolean);

        if (perfilesAEliminar.length === 0) {
            alert("Selecciona al menos un perfil para eliminar.");
            return;
        }

        let data = getFavProfileUsernames(load(storageKey, [])); // ✅ array de usernames normalizados
        data = data.filter(u => !perfilesAEliminar.includes(normalizeUsername(u)));

        save(storageKey, data);

        btn.textContent = "ELIMINAR PERFIL";
        eliminarTodoPerfilesFav.style.display = "none";
        cancelarPerfilesFav.style.display = "none";

        console.log("Perfiles eliminados:", perfilesAEliminar);
        modoEliminarPerfiles = false;
        renderFavoritos();
    }
}

function renderFavoritos() {
    const ulJuegosFav = document.getElementById("listaJuegosFav");
    const ulPerfilesFav = document.getElementById("listaPerfilesFav");
    if (!ulJuegosFav || !ulPerfilesFav) return;

    const session = getSession();
    let myUsername = normalizeUsername(session?.username);
    console.log("Usuario en sesión:", myUsername);

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
                li.dataset.id = String(g.id); // para referencia al eliminar
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
            li.dataset.username = normalizeUsername(u.username); // para referencia al eliminar
            const a = document.createElement("a");
            a.href = `otroPerfil.html?u=${encodeURIComponent(u.username)}`;
            // si no tienes "name", usa username
            a.textContent = u.username ? `${u.name} (${u.username})` : `${u.username}`;
            li.appendChild(a);
            ulPerfilesFav.appendChild(li);
        });
    }
}

function desactivarModoEliminar(checkboxClass) {
    if (checkboxClass === "checkboxEliminarJuegos") {
        modoEliminarJuegos = false;
        document.querySelectorAll(".checkboxEliminarJuegos").forEach(cb => cb.remove());
    } else if (checkboxClass === "checkboxEliminarPerfiles") {
        modoEliminarPerfiles = false;
        document.querySelectorAll(".checkboxEliminarPerfiles").forEach(cb => cb.remove());
    }
}

eliminarJuegosFav?.addEventListener("click", () => {
    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;
    const gamesFavoritos = load("likes_games_" + myUsername, []);
    if (gamesFavoritos.length === 0) {
        alert("No tienes juegos favoritos para eliminar.");
        return;
    }
    activarModoEliminarJuegos({ botonId: "btn_eliminarJuegosFav", listaId: "listaJuegosFav", storageKey: "likes_games_" + myUsername });
});

eliminarPerfilesFav?.addEventListener("click", () => {
    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;
    const perfilesFavoritos = load("favoritos_" + myUsername, []);
    if (perfilesFavoritos.length === 0) {
        alert("No tienes perfiles favoritos para eliminar.");
        return;
    }
    activarModoEliminarPerfiles({ botonId: "btn_eliminarPerfilesFav", listaId: "listaPerfilesFav", storageKey: "favoritos_" + myUsername });
});

cancelarJuegosFav?.addEventListener("click", () => {
    desactivarModoEliminar("checkboxEliminarJuegos");
    eliminarTodoJuegosFav.style.display = "none";
    cancelarJuegosFav.style.display = "none";
    eliminarJuegosFav.textContent = "ELIMINAR JUEGO";
});

cancelarPerfilesFav?.addEventListener("click", () => {
    desactivarModoEliminar("checkboxEliminarPerfiles");
    eliminarTodoPerfilesFav.style.display = "none";
    cancelarPerfilesFav.style.display = "none";
    eliminarPerfilesFav.textContent = "ELIMINAR PERFIL";
});

eliminarTodoJuegosFav?.addEventListener("click", () => {
    if (!confirm("¿Estás seguro de que quieres eliminar todos tus juegos favoritos?")) {
        return;
    }
    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;
    if (myUsername) {
        save("likes_games_" + myUsername, []);
        renderFavoritos();
    }

    eliminarJuegosFav.textContent = "ELIMINAR JUEGO";
    eliminarTodoJuegosFav.style.display = "none";
    cancelarJuegosFav.style.display = "none";
});

eliminarTodoPerfilesFav?.addEventListener("click", () => {
    if (!confirm("¿Estás seguro de que quieres eliminar todos tus perfiles favoritos?")) {
        return;
    }
    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;
    if (myUsername) {
        save("favoritos_" + myUsername, []);
        renderFavoritos();
    }

    eliminarPerfilesFav.textContent = "ELIMINAR PERFIL";
    eliminarTodoPerfilesFav.style.display = "none";
    cancelarPerfilesFav.style.display = "none";
});

document.addEventListener("DOMContentLoaded", renderFavoritos);