import { requireSession, watchAuthChanges, getSessionSupabase } from "./session.js";
import { supabase } from "./supabaseClient.js";

/* ========================= */
/* ===== CONFIG ============ */
/* ========================= */

const RECOM_LIMIT = 10;

/* ========================= */
/* ===== UTIL ============== */
/* ========================= */

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* ========================= */
/* ===== RENDER ============ */
/* ========================= */

async function renderRecomendados() {

    const ul = document.getElementById("listaRecomendados");
    if (!ul) return;

    const s = await getSessionSupabase();
    const myId = s?.profile?.id;

    if (!myId) return;

    ul.innerHTML = "";

    // 🔹 Traemos juegos + dueño
    const { data: games, error } = await supabase
        .from("games")
        .select(`
      id,
      title,
      plataforma,
      estado,
      owner_id,
      profiles:owner_id (
        username
      )
    `)
        .neq("owner_id", myId) // 👈 no mostrar mis juegos
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        ul.innerHTML = "<li>Error cargando juegos.</li>";
        return;
    }

    if (!games?.length) {
        ul.innerHTML = "<li>No hay juegos disponibles.</li>";
        return;
    }

    const seleccionados = shuffle(games).slice(0, RECOM_LIMIT);

    seleccionados.forEach(g => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;

        const owner = g.profiles?.username ? ` - ${g.profiles.username}` : "";
        a.textContent = `${g.title} - ${g.plataforma} - ${g.estado}${owner}`;

        li.appendChild(a);
        ul.appendChild(li);
    });
}

/* ========================= */
/* ===== EVENTOS =========== */
/* ========================= */

document.getElementById("btnRefrescar")
    ?.addEventListener("click", renderRecomendados);

document.addEventListener("DOMContentLoaded", async () => {

    await requireSession({
        onAuthed: async ({ profile }) => {
            closeModal();
            await renderRecomendados();
        },
        onNoSession: () => {
            openModal();
        }
    });

    watchAuthChanges({
        onLogin: async () => {
            closeModal();
            await renderRecomendados();
        },
        onLogout: () => {
            openModal();
            const ul = document.getElementById("listaRecomendados");
            if (ul) ul.innerHTML = "";
        }
    });

});