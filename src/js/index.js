// ===== Helpers mínimos (solo para index) =====
function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const RECOM_LIMIT = 10; // <-- X juegos a mostrar (cambia a lo que quieras)
const SEEN_KEY = "recomendados_seen_ids"; // sessionStorage

// ===== Render lista recomendados =====
function renderRecomendados() {
    const ul = document.getElementById("listaRecomendados");
    if (!ul) return;

    const games = load("games", []);
    const session = load("session", null);
    const myUsername = session?.username ? String(session.username).trim().toLocaleLowerCase() : null;

    // Limpia lo que haya (tus <li> de ejemplo incluidos)
    ul.innerHTML = "";

    const recomendados = games.filter(g => {
        if (!myUsername) return true; // si no hay sesión, muestro todo
        const owner = String(g.ownerUsername || "").trim().toLocaleLowerCase();
        return owner !== myUsername; // si hay sesión, solo muestro los que no son míos
    });

    if (!recomendados.length) {
        const li = document.createElement("li");
        li.textContent = myUsername
            ? "No hay juegos todavía. Usa seedGamesFromUsers(10) en consola."
            : "No hay juegos todavía";
        ul.appendChild(li);
        return;
    }

    const seenIds = (() => {
        try { return JSON.parse(sessionStorage.getItem(SEEN_KEY)) || []; }
        catch { return []; }
    })();

    const notSeen = recomendados.filter(g => !seenIds.includes(g.id));
    let chosen;

    if (notSeen.length > RECOM_LIMIT) {
        chosen = shuffle(notSeen).slice(0, RECOM_LIMIT);
    } else {
        chosen = shuffle(recomendados).slice(0, Math.min(RECOM_LIMIT, recomendados.length));
    }

    sessionStorage.setItem(SEEN_KEY, JSON.stringify(chosen.map(g => g.id)));

    chosen.forEach(g => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;
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