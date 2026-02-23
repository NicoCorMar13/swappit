const anadirJuego = document.getElementById("btnAnadirJuego");
const eliminarJuegos = document.getElementById("btnEliminarJuegos");
let modoEliminar = false;

anadirJuego?.addEventListener("click", () => { window.location.href = "anadirJuego.html"; });
eliminarJuegos?.addEventListener("click", () => { activarModoEliminar({ botonId: "btnEliminarJuegos", listaId: "listaMisJuegos", storageKey: "games" }); });

// eliminarJuegos?.addEventListener("click", () => {
//     if (confirm("¿Estás seguro de que quieres eliminar todos los juegos?")) {
//         localStorage.removeItem("games");
//         renderRecomendados();
//     }
// });

function getSession() {
    try { return JSON.parse(localStorage.getItem("session")); }
    catch { return null; }
}

function activarModoEliminar({ botonId, listaId, storageKey}) {
    const btn = document.getElementById(botonId);
    const ul = document.getElementById(listaId);
    if (!btn || !ul) return;

    const items = ul.querySelectorAll("li");

    if (!modoEliminar) {
        // Activar modo seleccion
        modoEliminar = true;

        items.forEach(li => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkboxEliminar");
            li.prepend(checkbox);
        });
    } else {
        // Eliminar seleccionados
        const seleccionados = ul.querySelectorAll(".checkboxEliminar:checked");

        if (seleccionados.length === 0) {
            // Cancelamos si no hay ninguno seleccionado
            modoEliminar = false;
            ul.querySelectorAll(".checkboxEliminar").forEach(cb => cb.remove());
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

        //Reset
        modoEliminar = false;
        renderMisJuegos();
    }
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

document.addEventListener("DOMContentLoaded", renderMisJuegos);