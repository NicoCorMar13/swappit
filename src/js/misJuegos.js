import { requireSession } from "./session.js";
import { supabase } from "./supabaseClient.js";

const anadirJuego = document.getElementById("btnAnadirJuego");
const eliminarJuegos = document.getElementById("btnEliminarJuegos");
const eliminarTodo = document.getElementById("btnEliminarTodo");

let modoEliminar = false;
let misJuegosActuales = [];
let myId = null;

document.addEventListener("DOMContentLoaded", async () => {
    await requireSession({
        redirectTo: "index.html",
        onAuthed: async ({ profile }) => {
            myId = profile.id;
            await cargarMisJuegos();
        }
    });
});

async function cargarMisJuegos() {
    const { data, error } = await supabase
        .from("games")
        .select("id, title, plataforma, estado, created_at")
        .eq("owner_id", myId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        alert("Error cargando juegos");
        return;
    }

    misJuegosActuales = data || [];
    renderMisJuegos();
}

function renderMisJuegos() {
    const ul = document.getElementById("listaMisJuegos");
    if (!ul) return;

    ul.innerHTML = "";

    if (!misJuegosActuales.length) {
        const li = document.createElement("li");
        li.textContent = "No has añadido aún ningún juego.";
        ul.appendChild(li);
        return;
    }

    misJuegosActuales.forEach(g => {
        const li = document.createElement("li");
        li.dataset.id = g.id;

        if (modoEliminar) {
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.className = "checkboxEliminar";
            li.appendChild(cb);
        }

        const a = document.createElement("a");
        a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;
        a.textContent = `${g.title} - ${g.plataforma} - ${g.estado}`;

        li.appendChild(a);
        ul.appendChild(li);
    });
}

/* ========================= */
/* ===== MODO ELIMINAR ===== */
/* ========================= */

function setModoEliminarUI(on) {
    modoEliminar = on;

    if (!anadirJuego || !eliminarJuegos || !eliminarTodo) return;

    if (on) {
        anadirJuego.textContent = "CANCELAR";
        anadirJuego.style.backgroundColor = "red";
        anadirJuego.style.color = "white";

        eliminarJuegos.textContent = "ELIMINAR SELECCIONADOS";
        eliminarTodo.style.display = "inline-block";
    } else {
        anadirJuego.textContent = "AÑADIR JUEGO";
        anadirJuego.style.backgroundColor = "";
        anadirJuego.style.color = "";

        eliminarJuegos.textContent = "ELIMINAR JUEGOS";
        eliminarTodo.style.display = "none";
    }
}

function cancelarModoEliminar() {
    setModoEliminarUI(false);
    renderMisJuegos();
}

async function eliminarSeleccionados(ids) {
    const { error } = await supabase
        .from("games")
        .delete()
        .in("id", ids)
        .eq("owner_id", myId); // seguridad extra

    if (error) {
        console.error(error);
        alert("Error eliminando juegos");
        return;
    }

    await cargarMisJuegos();
}

/* ========================= */
/* ===== EVENTOS =========== */
/* ========================= */

anadirJuego?.addEventListener("click", () => {
    if (modoEliminar) {
        cancelarModoEliminar();
        return;
    }
    window.location.href = "anadirJuego.html";
});

eliminarJuegos?.addEventListener("click", async () => {
    const ul = document.getElementById("listaMisJuegos");
    if (!ul) return;

    if (!modoEliminar) {
        if (!misJuegosActuales.length) {
            alert("No tienes juegos que eliminar.");
            return;
        }
        setModoEliminarUI(true);
        renderMisJuegos();
        return;
    }

    // ya estamos en modo eliminar: borramos seleccionados
    const seleccionados = ul.querySelectorAll(".checkboxEliminar:checked");
    const ids = [...seleccionados]
        .map(cb => cb.closest("li")?.dataset.id)
        .filter(Boolean);

    if (!ids.length) {
        alert("Selecciona al menos un juego para eliminar.");
        return;
    }

    await eliminarSeleccionados(ids);
    setModoEliminarUI(false);
});

eliminarTodo?.addEventListener("click", async () => {
    if (!confirm("¿Seguro que quieres eliminar todos tus juegos?")) return;

    const { error } = await supabase
        .from("games")
        .delete()
        .eq("owner_id", myId);

    if (error) {
        console.error(error);
        alert("Error eliminando juegos");
        return;
    }

    await cargarMisJuegos();
    setModoEliminarUI(false);
});