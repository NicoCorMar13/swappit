// ===== Helpers =====
function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function getSession() {
    return load("session", null); // ideal: { username: "...", name: "...", email:"..." }
}
function getParam(name) {
    return new URLSearchParams(location.search).get(name);
}

function findGameById(gid) {
    const games = load("games", []);
    return games.find(g => String(g.id) === String(gid)) || null;
}

function likesKeyFor(username) {
    return `likes_games_${username}`;
}

function isLiked(gameId, username) {
    const arr = load(likesKeyFor(username), []);
    return arr.includes(gameId);
}

function toggleLike(gameId, username) {
    const key = likesKeyFor(username);
    const arr = load(key, []);
    const idx = arr.indexOf(gameId);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(gameId);
    save(key, arr);
    return arr.includes(gameId);
}

// ===== Render =====
function renderJuego() {
    const gid = getParam("gid");
    if (!gid) {
        alert("Falta el id del juego en la URL. Vuelve a inicio y entra desde la lista.");
        return;
    }

    const game = findGameById(gid);
    if (!game) {
        alert("Juego no encontrado. Puede que se haya borrado de localStorage.");
        return;
    }

    const session = getSession();
    const myUsername = session?.username || null;
    const isMine = myUsername && game.ownerUsername === myUsername;

    // Elementos DOM
    const h1Nombre = document.getElementById("nombreJuego") || document.querySelector("h1.nombreJuego");
    const pDesc = document.getElementById("descripcionJuego");
    const h2Plat = document.getElementById("plataformaJuego");
    const pTags = document.getElementById("etiquetasJuego");

    // Dueño: tu HTML tiene <h2 id="dueno"><a ...>...</a></h2>
    const h2Dueno = document.getElementById("dueno");
    const aDueno = document.getElementById("linkDueno") || h2Dueno?.querySelector("a");

    // Botones
    const btnChat = document.getElementById("btnIniciarChat");
    const btnFav = document.getElementById("btnFav");

    // Pintar contenido
    if (h1Nombre) h1Nombre.textContent = (game.title || "").toUpperCase();
    document.title = game.title ? `${game.title} | Juego` : document.title;

    if (pDesc) pDesc.textContent = game.description || "";
    if (h2Plat) h2Plat.textContent = game.platform || "";

    // Dueño (mostrar username por ahora, luego si quieres mostramos nombre completo buscando en users)
    if (aDueno) {
        aDueno.textContent = game.ownerUsername || "—";
        aDueno.href = `otroPerfil.html?u=${encodeURIComponent(game.ownerUsername)}`;
    }

    // Tags (si viene array => #tag1 #tag2; si viene string => lo dejo)
    if (pTags) {
        const tags = game.tags;
        if (Array.isArray(tags)) {
            pTags.textContent = tags.map(t => `#${t}`).join(" ");
        } else if (typeof tags === "string") {
            pTags.textContent = tags;
        } else {
            pTags.textContent = "";
        }
    }

    // CHAT (de momento placeholder)
    if (btnChat) {
        if (!myUsername) {
            btnChat.disabled = true;
            btnChat.textContent = "INICIA SESIÓN";
        } else if (isMine) {
            btnChat.disabled = true;
            btnChat.textContent = "ES TU JUEGO";
        } else {
            btnChat.disabled = false;
            btnChat.textContent = "CHAT";
            btnChat.addEventListener("click", () => {
                alert("Chat pendiente de implementar 😉");
                // luego aquí: abrir chat con ownerUsername + game.id
            });
        }
    }

    // LIKE ❤️
    if (btnFav) {
        if (!myUsername) {
            btnFav.disabled = true;
            btnFav.title = "Inicia sesión para dar me gusta";
            btnFav.style.opacity = "0.6";
        } else if (isMine) {
            btnFav.disabled = true;
            btnFav.title = "No puedes darte like a tu propio juego";
            btnFav.style.opacity = "0.6";
        } else {
            const liked = isLiked(game.id, myUsername);
            btnFav.textContent = liked ? "❤️" : "🤍";
            btnFav.title = liked ? "Quitar me gusta" : "Dar me gusta";

            btnFav.addEventListener("click", () => {
                const nowLiked = toggleLike(game.id, myUsername);
                btnFav.textContent = nowLiked ? "❤️" : "🤍";
                btnFav.title = nowLiked ? "Quitar me gusta" : "Dar me gusta";
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", renderJuego);


// const btnChat = document.getElementById("btnIniciarChat");

// btnChat.addEventListener("click", () => {
//     window.location.href = "chats.html";
// });