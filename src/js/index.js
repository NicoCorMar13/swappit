import { requireSession, watchAuthChanges, getSessionSupabase } from "./session.js";
import { supabase } from "./supabaseClient.js";

console.log("index cargado ✅");

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
    console.log("Hemos creado array");
    return a;
}

async function waitForSession(ms = 1500) {
    const start = Date.now();
    while (Date.now() - start < ms) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) return data.session;
        await new Promise(r => setTimeout(r, 80));
    }
    return null;
}

async function bootIndex() {
    const ul = document.getElementById("listaRecomendados");
    if (!ul) return;

    // 1) Sesión auth (rápido)
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    if (!session?.user?.id) {
        openModal();
        ul.innerHTML = "<li>Inicia sesión para ver recomendados.</li>";
        return;
    }

    // 2) Perfil (puede tardar)
    const s = await getSessionSupabase();
    const myId = s?.profile?.id;

    if (!myId) {
        // hay sesión pero no perfil todavía / fallo puntual
        // reintenta 1 vez tras un tick
        await new Promise(r => setTimeout(r, 150));
        const s2 = await getSessionSupabase();
        if (!s2?.profile?.id) {
            openModal();
            ul.innerHTML = "<li>Error cargando tu perfil. Recarga o prueba de nuevo.</li>";
            return;
        }
    }

    closeModal();
    await renderRecomendados();
}

/* ========================= */
/* ===== RENDER ============ */
/* ========================= */

async function renderRecomendados() {

    const ul = document.getElementById("listaRecomendados");
    if (!ul) return;

    const s = await getSessionSupabase();
    const myId = s?.profile?.id;

    console.log("Hasta aqui hemos llegado 5");

    if (!myId) {
        ul.innerHTML = "<li>Inicia sesión para ver recomendados.</li>";
        return;
    }

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

    console.log("Hasta aqui hemos llegado 6");

    if (error) {
        console.error(error);
        ul.innerHTML = "<li>Error cargando juegos.</li>";
        return;
    }

    console.log("Hasta aqui hemos llegado 7");

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

    console.log("Hasta aqui hemos llegado 8");
}

/* ========================= */
/* ===== EVENTOS =========== */
/* ========================= */

// document.getElementById("btnRefrescar")
//     ?.addEventListener("click", (e) => {
//         e.preventDefault();
//         renderRecomendados;
//     });

document.addEventListener("DOMContentLoaded", async () => {
    const btn = document.getElementById("btnRefrescar");
    console.log("btnRefrescar encontrado?", !!btn);

    btn?.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("CLICK refrescar ✅");
        await renderRecomendados();
    });

    await bootIndex();

    supabase.auth.onAuthStateChange(async (event) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
            await bootIndex();
        }
    });

});