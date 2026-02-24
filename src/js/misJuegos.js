const anadirJuego = document.getElementById("btnAnadirJuego");
const eliminarJuegos = document.getElementById("btnEliminarJuegos");
const eliminarTodo = document.getElementById("btnEliminarTodo");
let modoEliminar = false;

function cancelarModoEliminar() {
    modoEliminar = false;
    document.querySelectorAll(".checkboxEliminar").forEach(cb => cb.remove());
}

function activarModoEliminar({ botonId, listaId, storageKey }) {
    const btn = document.getElementById(botonId);
    const ul = document.getElementById(listaId);
    if (!btn || !ul) return;

    const items = ul.querySelectorAll("li");

    if (!modoEliminar) {
        // Activar modo seleccion
        modoEliminar = true;

        anadirJuego.textContent = "CANCELAR";
        anadirJuego.style.backgroundColor = "red";
        anadirJuego.style.color = "white";
        btn.textContent = "ELIMINAR SELECCIONADOS";
        eliminarTodo.style.display = "inline-block";

        items.forEach(li => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkboxEliminar");
            li.prepend(checkbox);
        });
    } else {
        // Eliminar seleccionados
        const seleccionados = ul.querySelectorAll(".checkboxEliminar:checked");

        anadirJuego.textContent = "AÑADIR JUEGO";
        btn.textContent = "ELIMINAR JUEGOS";
        anadirJuego.style.backgroundColor = "";
        anadirJuego.style.color = "";

        if (seleccionados.length === 0) {
            // Cancelamos si no hay ninguno seleccionado
            modoEliminar = false;
            ul.querySelectorAll(".checkboxEliminar").forEach(cb => cb.remove());
            alert("Selecciona al menos un juego para eliminar.");
            return;
        }
        let data = load(storageKey, []);
        const idsAEliminar = [];
        seleccionados.forEach(cb => {
            const li = cb.closest("li");
            idsAEliminar.push(li.dataset.id);
        });
        data = data.filter(item => !idsAEliminar.includes(String(item.id)));
        localStorage.setItem(storageKey, JSON.stringify(data));

        console.log("IDs eliminados:", idsAEliminar);
        console.log("Games tras borrar:", load(storageKey, []));

        const afectados = purgeGameIdsFromAllLikes(idsAEliminar); // Elimina los juegos de los likes de todos los usuarios
        console.log(`Juegos eliminados de favoritos de ${afectados} usuarios.`);

        //Reset
        modoEliminar = false;
        renderMisJuegos();
    }
}

function purgeGameIdsFromAllLikes(gids) {
    const ids = new Set((Array.isArray(gids) ? gids : [gids]).map(x => String(x)));

    const users = load("users", []);
    if (!Array.isArray(users) || users.length === 0) {
        console.warn("purgeGameIdsFromAllLikes: no hay users en localStorage");
        return 0;
    }

    let touched = 0;

    for (const u of users) {
        const username = (u?.username ?? "").toString().trim();
        if (!username) continue;

        // AJUSTA si tu key real es otra
        const likesKey = `likes_games_${username}`;

        const likes = load(likesKey, []);
        if (!Array.isArray(likes) || likes.length === 0) continue;

        const before = likes.length;

        // Soporta ["g1","g2"] o [{id:"g1"}, ...]
        const cleaned = likes.filter(x => {
            const xid = (typeof x === "object" && x !== null) ? x.id : x;
            return !ids.has(String(xid));
        });

        if (cleaned.length !== before) {
            save(likesKey, cleaned);
            touched++;
        }
    }

    return touched; // nº de usuarios donde se eliminaron likes
}

function renderMisJuegos() {
    const ul = document.getElementById("listaMisJuegos");
    if (!ul) return;

    const games = load("games", []);
    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;

    ul.innerHTML = "";

    // Filtra: si hay sesión, quita los juegos del usuario logueado
    const misJuegos = games.filter(g => {
        if (!myUsername) return true; // si no hay sesión, muestra todo
        const owner = String(g.ownerUsername || "").trim().toLowerCase();
        return owner === myUsername;
    });

    if (!misJuegos.length) {
        const li = document.createElement("li");
        li.textContent = myUsername
            ? `"No has añadido aún ningún juego, ${session.name}. Usa el botón 'Añadir juego' para compartir tus juegos con la comunidad."`
            : "No hay juegos todavía.";
        ul.appendChild(li);
        return;
    }

    misJuegos
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .forEach(g => {
            const li = document.createElement("li");
            li.dataset.id = String(g.id); // para referencia al eliminar
            const a = document.createElement("a");
            a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;
            a.textContent = `${g.title} - ${g.platform} - ${g.condition}`;
            li.appendChild(a);
            ul.appendChild(li);
        });
}

anadirJuego?.addEventListener("click", () => {
    if (modoEliminar) {
        cancelarModoEliminar();
        anadirJuego.textContent = "AÑADIR JUEGO";
        anadirJuego.style.backgroundColor = "";
        anadirJuego.style.color = "";
        eliminarJuegos.textContent = "ELIMINAR JUEGOS";
        eliminarTodo.style.display = "none";
        return;
    } else {
        window.location.href = "anadirJuego.html";
    }
});

eliminarTodo?.addEventListener("click", () => {
    if (!confirm("¿Estás seguro de que quieres eliminar todos tus juegos? Esta acción no se puede deshacer.")) {
        return;
    }

    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;
    if (!myUsername) return;

    const games = load("games", []);
    const gamesFiltrados = games.filter(g => {
        const owner = String(g.ownerUsername || "").trim().toLowerCase();
        return owner !== myUsername; // mantenemos solo los que no son del usuario
    });
    localStorage.setItem("games", JSON.stringify(gamesFiltrados));
    eliminarTodo.style.display = "none";
    eliminarJuegos.textContent = "ELIMINAR JUEGOS";
    anadirJuego.style.backgroundColor = "";
    anadirJuego.style.color = "";
    anadirJuego.textContent = "AÑADIR JUEGO";
    renderMisJuegos();
});

eliminarJuegos?.addEventListener("click", () => {
    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;
    const games = load("games", []);
    const gamesFiltrados = games.filter(g => {
        const owner = String(g.ownerUsername || "").trim().toLowerCase();
        return owner === myUsername; // mantenemos solo los que son del usuario
    });
    if (gamesFiltrados.length === 0) {
        alert("No tienes juegos que eliminar.");
        return;
    }
    activarModoEliminar({
        botonId: "btnEliminarJuegos",
        listaId: "listaMisJuegos",
        storageKey: "games"
    });
});

document.addEventListener("DOMContentLoaded", renderMisJuegos);