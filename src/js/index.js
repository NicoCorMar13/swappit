// ===== Helpers mínimos (solo para index) =====
function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

// ===== Render lista recomendados =====
function renderRecomendados() {
    const ul = document.getElementById("listaRecomendados");
    if (!ul) return;

    const games = load("games", []);

    // Limpia lo que haya (tus <li> de ejemplo incluidos)
    ul.innerHTML = "";

    if (!games.length) {
        const li = document.createElement("li");
        li.textContent = "No hay juegos todavía. Usa seedGamesFromUsers(10) en consola.";
        ul.appendChild(li);
        return;
    }

    // (Opcional) orden por más nuevos primero
    games
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .forEach(g => {
            const li = document.createElement("li");
            const a = document.createElement("a");

            // IMPORTANTE: si tu detalle se llama juego.html, ponlo aquí
            a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;

            // Lo que tú querías ver en inicio:
            a.textContent = `${g.title} - ${g.platform} - ${g.condition} - ${g.ownerUsername}`;

            li.appendChild(a);
            ul.appendChild(li);
        });
}

// ===== Botón refrescar =====
document.getElementById("btnRefrescar")?.addEventListener("click", renderRecomendados);

// Render al cargar la página
document.addEventListener("DOMContentLoaded", renderRecomendados);


// const btnChat = document.getElementById("btnChat");

// btnChat.addEventListener("click", () => {
//     window.location.href = "chats.html";
// });