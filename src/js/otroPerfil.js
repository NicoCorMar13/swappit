import { requireSession, getSessionSupabase } from "./session.js";
import { supabase } from "./supabaseClient.js";

/* ====== OTRO PERFIL ====== */

const btnAnadirPerfilFav = document.querySelector(".anadirPerfilFav");

const elUsername = document.querySelector(".usernameOtroPerfil");
const elNombreCompleto = document.querySelector(".nombreCompletoOtroPerfil");
const ulJuegos = document.getElementById("listaJuegosOtroPerfil");

let myId = null;
let otroId = null;

function getIdFromUrl() {
    return new URLSearchParams(location.search).get("id");
}

document.addEventListener("DOMContentLoaded", async () => {

    await requireSession({
        redirectTo: "index.html",
        onAuthed: async ({ profile }) => {
            myId = profile.id;
            otroId = getIdFromUrl();

            if (!otroId) {
                alert("Perfil no válido.");
                return;
            }

            await renderOtroPerfil();
        }
    });

});

/* ========================= */
/* ===== RENDER PERFIL ==== */
/* ========================= */

async function renderOtroPerfil() {

    // 1️⃣ Cargar datos del perfil
    const { data: user, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otroId)
        .single();

    if (error || !user) {
        if (elUsername) elUsername.textContent = "Perfil no encontrado";
        if (ulJuegos) ulJuegos.innerHTML = "";
        return;
    }

    // Pintar datos
    if (elUsername) elUsername.textContent = user.username;
    if (elNombreCompleto)
        elNombreCompleto.textContent =
            `${user.name ?? ""} ${user.apellidos ?? ""}`.trim();

    // 2️⃣ Cargar juegos del usuario
    const { data: games, error: gamesErr } = await supabase
        .from("games")
        .select("id, title, plataforma, estado")
        .eq("owner_id", otroId)
        .order("created_at", { ascending: false });

    if (ulJuegos) {
        ulJuegos.innerHTML = "";

        if (gamesErr || !games?.length) {
            ulJuegos.innerHTML =
                `<li class="vacio">Este usuario no tiene juegos publicados.</li>`;
        } else {
            games.forEach(g => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = `juego.html?gid=${encodeURIComponent(g.id)}`;
                a.textContent = `${g.title} - ${g.plataforma} - ${g.estado}`;
                li.appendChild(a);
                ulJuegos.appendChild(li);
            });
        }
    }

    await actualizarEstadoBoton();
}

/* ========================= */
/* ===== FAVORITOS ======== */
/* ========================= */

async function actualizarEstadoBoton() {
    if (!btnAnadirPerfilFav) return;

    if (!myId) {
        btnAnadirPerfilFav.disabled = true;
        btnAnadirPerfilFav.textContent = "INICIA SESIÓN";
        return;
    }

    if (myId === otroId) {
        btnAnadirPerfilFav.disabled = true;
        btnAnadirPerfilFav.textContent = "ESTE ES TU PERFIL";
        return;
    }

    const { data } = await supabase
        .from("favorite_users")
        .select("favorite_user_id")
        .eq("user_id", myId)
        .eq("favorite_user_id", otroId)
        .maybeSingle();

    const estaEnFavoritos = !!data;

    btnAnadirPerfilFav.textContent =
        estaEnFavoritos ? "QUITAR DE FAVORITOS" : "AÑADIR PERFIL A FAVORITOS";

    btnAnadirPerfilFav.classList.toggle("enFavoritos", estaEnFavoritos);

    btnAnadirPerfilFav.onclick = async (e) => {
        e.preventDefault();

        if (estaEnFavoritos) {
            await supabase
                .from("favorite_users")
                .delete()
                .eq("user_id", myId)
                .eq("favorite_user_id", otroId);
        } else {
            await supabase
                .from("favorite_users")
                .insert({
                    user_id: myId,
                    favorite_user_id: otroId
                });
        }

        await actualizarEstadoBoton();
    };
}