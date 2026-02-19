const anadirJuego = document.getElementById("btnAnadirJuego");
const eliminarJuegos = document.getElementById("btnEliminarJuegos");

anadirJuego?.addEventListener("click", () => { window.location.href = "anadirJuego.html"; });

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

function renderRecomendados() {
    const ul = document.getElementById("listaMisJuegos");
    if (!ul) return;

    const games = load("games", []);
    const session = getSession();
    const myUsername = session?.username ? String(session.username).trim().toLowerCase() : null;

    ul.innerHTML = "";

    // Filtra: si hay sesión, quita los juegos del usuario logueado
    const recomendados = games.filter(g => {
        if (!myUsername) return true; // si no hay sesión, muestra todo
        const owner = String(g.ownerUsername || "").trim().toLowerCase();
        return owner === myUsername;
    });

    if (!recomendados.length) {
        const li = document.createElement("li");
        li.textContent = myUsername
            ? `"No has añadido aún ningún juego, ${session.name}. Usa el botón 'Añadir juego' para compartir tus juegos con la comunidad."`
            : "No hay juegos todavía.";
        ul.appendChild(li);
        return;
    }

    recomendados
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .forEach(g => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;
            a.textContent = `${g.title} - ${g.platform} - ${g.condition}`;
            li.appendChild(a);
            ul.appendChild(li);
        });
}

document.addEventListener("DOMContentLoaded", renderRecomendados);


