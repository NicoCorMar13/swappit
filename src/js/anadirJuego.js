import { requireSession } from "./session.js";
import { supabase } from "./supabaseClient.js";

const nombreInput = document.getElementById("anadirJuego_nombre");
const descripcionInput = document.getElementById("anadirJuego_descripcion");
const plataformaInput = document.getElementById("anadirJuego_plataforma");
const estadoInput = document.getElementById("selectorEstado");
const etiquetasInput = document.getElementById("anadirJuego_etiquetas");

let myId = null;
let editingGameId = new URLSearchParams(location.search).get("gid");

document.addEventListener("DOMContentLoaded", async () => {

    await requireSession({
        redirectTo: "index.html",
        onAuthed: async ({ profile }) => {
            myId = profile.id;

            if (editingGameId) {
                await cargarJuegoParaEdicion(editingGameId);
            }
        }
    });

});

async function cargarJuegoParaEdicion(gid) {
    const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gid)
        .eq("owner_id", myId) // seguridad extra
        .single();

    if (error || !data) {
        alert("No puedes editar este juego.");
        window.location.href = "misJuegos.html";
        return;
    }

    nombreInput.value = data.title || "";
    descripcionInput.value = data.descripcion || "";
    plataformaInput.value = data.plataforma || "";
    estadoInput.value = data.estado || "";
    etiquetasInput.value = Array.isArray(data.etiquetas)
        ? data.etiquetas.join(", ")
        : "";
}

document.getElementById("btnGuardarJuego")?.addEventListener("click", async (e) => {
    e.preventDefault();

    const title = nombreInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const plataforma = plataformaInput.value.trim();
    const estado = estadoInput.value.trim();
    const etiquetas = etiquetasInput.value
        .trim()
        .toLowerCase()
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

    if (!title || !descripcion || !plataforma || !estado || !etiquetas.length) {
        alert("Completa todos los campos.");
        return;
    }

    if (editingGameId) {
        // EDITAR
        const { error } = await supabase
            .from("games")
            .update({
                title,
                descripcion,
                plataforma,
                estado,
                etiquetas
            })
            .eq("id", editingGameId)
            .eq("owner_id", myId);

        if (error) {
            console.error(error);
            alert("Error editando juego");
            return;
        }

        alert("Juego editado correctamente.");
    } else {
        // CREAR
        const { error } = await supabase
            .from("games")
            .insert({
                owner_id: myId,
                title,
                descripcion,
                plataforma,
                estado,
                etiquetas
            });

        if (error) {
            console.error(error);
            alert("Error creando juego");
            return;
        }

        alert("Juego añadido correctamente.");
    }

    window.location.href = "misJuegos.html";
});

document.getElementById("btnCancelar")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "misJuegos.html";
});