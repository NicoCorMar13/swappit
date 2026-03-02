import { requireSession } from "./session.js";
import { supabase } from "./supabaseClient.js";

const eliminarJuegosFav = document.getElementById("btn_eliminarJuegosFav");
const eliminarPerfilesFav = document.getElementById("btn_eliminarPerfilesFav");
const eliminarTodoJuegosFav = document.getElementById("btn_eliminarTodoJuegosFav");
const eliminarTodoPerfilesFav = document.getElementById("btn_eliminarTodoPerfilesFav");
const cancelarJuegosFav = document.getElementById("btn_cancelarJuegosFav");
const cancelarPerfilesFav = document.getElementById("btn_cancelarPerfilesFav");

let modoEliminarJuegos = false;
let modoEliminarPerfiles = false;

let myId = null;

// Cache de lo renderizado (para no reconsultar al eliminar seleccionados)
let favGamesRows = [];   // [{game_id, games:{...}}]
let favUsersRows = [];   // [{favorite_user_id, profiles:{...}}]

document.addEventListener("DOMContentLoaded", async () => {
    await requireSession({
        redirectTo: "index.html",
        onAuthed: async ({ profile }) => {
            myId = profile.id;
            await renderFavoritos();
        }
    });
});

// ======================
// CARGA + RENDER
// ======================
async function renderFavoritos() {
    const ulJuegosFav = document.getElementById("listaJuegosFav");
    const ulPerfilesFav = document.getElementById("listaPerfilesFav");
    if (!ulJuegosFav || !ulPerfilesFav) return;

    // 1) Juegos favoritos + datos del juego + dueño
    const { data: fg, error: fgErr } = await supabase
        .from("favorite_games")
        .select(`
      game_id,
      games:game_id (
        id,
        title,
        plataforma,
        estado,
        owner_id,
        profiles:owner_id ( id, username )
      )
    `)
        .eq("user_id", myId);

    if (fgErr) {
        console.error(fgErr);
        ulJuegosFav.innerHTML = "<li>Error cargando juegos favoritos.</li>";
    } else {
        favGamesRows = fg || [];
        pintarListaJuegos(ulJuegosFav, favGamesRows);
    }

    // 2) Perfiles favoritos + datos del perfil
    const { data: fu, error: fuErr } = await supabase
        .from("favorite_users")
        .select(`
      favorite_user_id,
      profiles:favorite_user_id ( id, username, name, apellidos )
    `)
        .eq("user_id", myId);

    if (fuErr) {
        console.error(fuErr);
        ulPerfilesFav.innerHTML = "<li>Error cargando perfiles favoritos.</li>";
    } else {
        favUsersRows = fu || [];
        pintarListaPerfiles(ulPerfilesFav, favUsersRows);
    }

    // Si sales de modo eliminar y recargas, limpia checkboxes/botones
    resetUIEliminar();
}

function pintarListaJuegos(ul, rows) {
    ul.innerHTML = "";

    const juegos = (rows || [])
        .map(r => r.games)
        .filter(Boolean);

    if (!juegos.length) {
        ul.innerHTML = "<li>No tienes juegos favoritos aún.</li>";
        return;
    }

    // Orden opcional por created_at si lo seleccionas. Como aquí no lo pedimos, dejamos tal cual.
    juegos.forEach(g => {
        const li = document.createElement("li");
        li.dataset.id = g.id;

        const a = document.createElement("a");
        a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;

        const owner = g.profiles?.username ? ` - ${g.profiles.username}` : "";
        a.textContent = `${g.title} - ${g.plataforma} - ${g.estado}${owner}`;

        li.appendChild(a);
        ul.appendChild(li);
    });
}

function pintarListaPerfiles(ul, rows) {
    ul.innerHTML = "";

    const perfiles = (rows || [])
        .map(r => r.profiles)
        .filter(Boolean);

    if (!perfiles.length) {
        ul.innerHTML = "<li>No tienes perfiles favoritos aún.</li>";
        return;
    }

    perfiles.forEach(p => {
        const li = document.createElement("li");
        li.dataset.id = p.id;

        const a = document.createElement("a");
        a.href = `otroPerfil.html?id=${encodeURIComponent(p.id)}`;

        const display = p.name ? `${p.name} (${p.username})` : p.username;
        a.textContent = display;

        li.appendChild(a);
        ul.appendChild(li);
    });
}

// ======================
// MODO ELIMINAR (UI)
// ======================
function activarModoEliminarJuegos() {
    const ul = document.getElementById("listaJuegosFav");
    if (!ul) return;

    const items = ul.querySelectorAll("li");
    if (!items.length || ul.textContent.includes("No tienes juegos favoritos")) {
        alert("No tienes juegos favoritos para eliminar.");
        return;
    }

    if (!modoEliminarJuegos) {
        modoEliminarJuegos = true;
        eliminarJuegosFav.textContent = "ELIMINAR SELECCIONADOS";
        eliminarTodoJuegosFav.style.display = "";
        cancelarJuegosFav.style.display = "";

        items.forEach(li => {
            if (!li.dataset.id) return;
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.className = "checkboxEliminarJuegos";
            li.prepend(cb);
        });
        return;
    }

    // Ya está activado: eliminar seleccionados
    eliminarSeleccionadosJuegos();
}

async function eliminarSeleccionadosJuegos() {
    const ul = document.getElementById("listaJuegosFav");
    const seleccionados = ul?.querySelectorAll(".checkboxEliminarJuegos:checked") || [];

    const ids = [...seleccionados]
        .map(cb => cb.closest("li")?.dataset.id)
        .filter(Boolean);

    if (!ids.length) {
        alert("Selecciona al menos un juego para eliminar.");
        return;
    }

    const { error } = await supabase
        .from("favorite_games")
        .delete()
        .eq("user_id", myId)
        .in("game_id", ids);

    if (error) {
        console.error(error);
        alert("Error eliminando juegos favoritos.");
        return;
    }

    await renderFavoritos();
}

function activarModoEliminarPerfiles() {
    const ul = document.getElementById("listaPerfilesFav");
    if (!ul) return;

    const items = ul.querySelectorAll("li");
    if (!items.length || ul.textContent.includes("No tienes perfiles favoritos")) {
        alert("No tienes perfiles favoritos para eliminar.");
        return;
    }

    if (!modoEliminarPerfiles) {
        modoEliminarPerfiles = true;
        eliminarPerfilesFav.textContent = "ELIMINAR SELECCIONADOS";
        eliminarTodoPerfilesFav.style.display = "";
        cancelarPerfilesFav.style.display = "";

        items.forEach(li => {
            if (!li.dataset.id) return;
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.className = "checkboxEliminarPerfiles";
            li.prepend(cb);
        });
        return;
    }

    eliminarSeleccionadosPerfiles();
}

async function eliminarSeleccionadosPerfiles() {
    const ul = document.getElementById("listaPerfilesFav");
    const seleccionados = ul?.querySelectorAll(".checkboxEliminarPerfiles:checked") || [];

    const ids = [...seleccionados]
        .map(cb => cb.closest("li")?.dataset.id)
        .filter(Boolean);

    if (!ids.length) {
        alert("Selecciona al menos un perfil para eliminar.");
        return;
    }

    const { error } = await supabase
        .from("favorite_users")
        .delete()
        .eq("user_id", myId)
        .in("favorite_user_id", ids);

    if (error) {
        console.error(error);
        alert("Error eliminando perfiles favoritos.");
        return;
    }

    await renderFavoritos();
}

function desactivarModoEliminar(tipo) {
    if (tipo === "juegos") {
        modoEliminarJuegos = false;
        document.querySelectorAll(".checkboxEliminarJuegos").forEach(cb => cb.remove());
        eliminarJuegosFav.textContent = "ELIMINAR JUEGO";
        eliminarTodoJuegosFav.style.display = "none";
        cancelarJuegosFav.style.display = "none";
    }
    if (tipo === "perfiles") {
        modoEliminarPerfiles = false;
        document.querySelectorAll(".checkboxEliminarPerfiles").forEach(cb => cb.remove());
        eliminarPerfilesFav.textContent = "ELIMINAR PERFIL";
        eliminarTodoPerfilesFav.style.display = "none";
        cancelarPerfilesFav.style.display = "none";
    }
}

function resetUIEliminar() {
    // por si venías con checkboxes puestas y recargas
    desactivarModoEliminar("juegos");
    desactivarModoEliminar("perfiles");
}

// ======================
// BOTONES
// ======================
eliminarJuegosFav?.addEventListener("click", activarModoEliminarJuegos);
eliminarPerfilesFav?.addEventListener("click", activarModoEliminarPerfiles);

cancelarJuegosFav?.addEventListener("click", () => desactivarModoEliminar("juegos"));
cancelarPerfilesFav?.addEventListener("click", () => desactivarModoEliminar("perfiles"));

eliminarTodoJuegosFav?.addEventListener("click", async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar todos tus juegos favoritos?")) return;

    const { error } = await supabase
        .from("favorite_games")
        .delete()
        .eq("user_id", myId);

    if (error) {
        console.error(error);
        alert("Error eliminando todos los juegos favoritos.");
        return;
    }

    await renderFavoritos();
});

eliminarTodoPerfilesFav?.addEventListener("click", async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar todos tus perfiles favoritos?")) return;

    const { error } = await supabase
        .from("favorite_users")
        .delete()
        .eq("user_id", myId);

    if (error) {
        console.error(error);
        alert("Error eliminando todos los perfiles favoritos.");
        return;
    }

    await renderFavoritos();
});