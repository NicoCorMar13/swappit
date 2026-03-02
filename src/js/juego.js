import { requireSession, getSessionSupabase } from "./session.js";
import { supabase } from "./supabaseClient.js";

function getParam(name) {
    return new URLSearchParams(location.search).get(name);
}

document.addEventListener("DOMContentLoaded", async () => {

    const gid = getParam("gid");
    if (!gid) {
        alert("Falta el id del juego en la URL.");
        return;
    }

    const s = await getSessionSupabase();
    const myId = s?.profile?.id || null;

    // 🔹 Cargar juego + dueño
    const { data: game, error } = await supabase
        .from("games")
        .select(`
      *,
      profiles:owner_id (
        id,
        username,
        name
      )
    `)
        .eq("id", gid)
        .single();

    if (error || !game) {
        alert("Juego no encontrado.");
        return;
    }

    const isMine = myId && game.owner_id === myId;

    // ===== Pintar datos =====

    const h1Nombre = document.getElementById("nombreJuego");
    const pDesc = document.getElementById("descripcionJuego");
    const h2Plat = document.getElementById("plataformaJuego");
    const h2Estado = document.getElementById("estado");
    const pTags = document.getElementById("etiquetasJuego");
    const aDueno = document.getElementById("linkDueno");

    if (h1Nombre) h1Nombre.textContent = (game.title || "").toUpperCase();
    document.title = game.title ? `${game.title} | Juego` : document.title;

    if (pDesc) pDesc.textContent = game.descripcion || "";
    if (h2Plat) h2Plat.textContent = game.plataforma || "";
    if (h2Estado) h2Estado.textContent = game.estado || "";

    // 🔹 Dueño
    if (aDueno) {
        const username = game.profiles?.username || "—";
        aDueno.textContent = username;

        if (isMine) {
            aDueno.textContent += " (TÚ)";
            aDueno.style.fontWeight = "bold";
            aDueno.style.color = "#4CAF50";
            aDueno.removeAttribute("href");
        } else {
            aDueno.href = `otroPerfil.html?id=${game.owner_id}`;
        }
    }

    // 🔹 Tags
    if (pTags) {
        if (Array.isArray(game.etiquetas)) {
            pTags.textContent = game.etiquetas.map(t => `#${t}`).join(" ");
        } else {
            pTags.textContent = "";
        }
    }

    const btnChat = document.getElementById("btnIniciarChat");
    const btnFav = document.getElementById("btnFav");

    // ===== CHAT =====
    if (btnChat) {
        if (!myId) {
            btnChat.disabled = true;
            btnChat.textContent = "INICIA SESIÓN";
        } else if (isMine) {
            btnChat.textContent = "EDITAR JUEGO";
            btnChat.addEventListener("click", () => {
                window.location.href = `anadirJuego.html?gid=${game.id}`;
            });
        } else {
            btnChat.textContent = "CHAT";
            btnChat.addEventListener("click", () => {
                alert("Chat pendiente 😉");
            });
        }
    }

    // ===== FAVORITOS =====
    if (btnFav) {

        if (!myId) {
            btnFav.disabled = true;
            btnFav.style.opacity = "0.6";
            return;
        }

        if (isMine) {
            btnFav.style.display = "none";
            return;
        }

        // 🔹 comprobar si ya está en favoritos
        const { data: fav } = await supabase
            .from("favorite_games")
            .select("game_id")
            .eq("user_id", myId)
            .eq("game_id", game.id)
            .maybeSingle();

        let liked = !!fav;

        actualizarBotonFav(btnFav, liked);

        btnFav.addEventListener("click", async () => {

            if (liked) {
                await supabase
                    .from("favorite_games")
                    .delete()
                    .eq("user_id", myId)
                    .eq("game_id", game.id);
            } else {
                await supabase
                    .from("favorite_games")
                    .insert({
                        user_id: myId,
                        game_id: game.id
                    });
            }

            liked = !liked;
            actualizarBotonFav(btnFav, liked);
        });
    }

});

function actualizarBotonFav(btn, liked) {
    btn.textContent = liked ? "❤️" : "🤍";
    btn.title = liked ? "Quitar me gusta" : "Dar me gusta";
}