import { requireSession, getSessionSupabase } from "./session.js";
import { supabase } from "./supabaseClient.js";

const btnEditarContraseña = document.getElementById("btnEditarContraseña");
const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const btnEliminarPerfil = document.getElementById("btnEliminarPerfil");

const inputUsername = document.getElementById("perfil_username");
const inputNombre = document.getElementById("perfil_nombre");
const inputApellidos = document.getElementById("perfil_apellidos");
const inputEmail = document.getElementById("perfil_email");
const inputContraseña = document.getElementById("perfil_contraseña");
const spanReContraseña = document.getElementById("perfil_spanRecontraseña")
const inputReContraseña = document.getElementById("perfil_recontraseña");

let myId = null;
let editMode = false;

document.addEventListener("DOMContentLoaded", async () => {

    await requireSession({
        redirectTo: "index.html",
        onAuthed: async ({ profile }) => {
            myId = profile.id;
            await cargarPerfil(profile);
        }
    });

});

async function cargarPerfil(profile) {

    inputUsername.value = profile.username || "";
    inputNombre.value = profile.name || "";
    inputApellidos.value = profile.apellidos || "";
    inputEmail.value = profile.email || "";
    inputContraseña.value = "************";

    bloquearInputs(true);
}

function bloquearInputs(bloquear) {
    inputNombre.disabled = bloquear;
    inputApellidos.disabled = bloquear;
    inputEmail.disabled = bloquear;
}

async function guardarCambiosPerfil() {

    const name = inputNombre.value.trim();
    const apellidos = inputApellidos.value.trim();
    const email = inputEmail.value.trim().toLowerCase();

    if (!name || !apellidos || !email) {
        alert("Los campos no pueden estar vacíos.");
        return;
    }

    // 1️⃣ Actualizar tabla profiles
    const { error: profileErr } = await supabase
        .from("profiles")
        .update({ name, apellidos, email })
        .eq("id", myId);

    if (profileErr) {
        console.error(profileErr);
        alert("Error actualizando perfil.");
        return;
    }

    // 2️⃣ Actualizar email en Auth (si cambió)
    const { error: authErr } = await supabase.auth.updateUser({
        email
    });

    if (authErr) {
        console.error(authErr);
        alert("Perfil actualizado, pero revisa tu correo para confirmar cambio de email.");
    }

    alert("Perfil actualizado correctamente.");
}

async function guardarNuevaContraseña() {

    const pass = inputContraseña.value.trim();
    const pass2 = inputReContraseña.value.trim();

    if (!pass || pass !== pass2) {
        alert("Las contraseñas no coinciden.");
        return false;
    }

    const { error } = await supabase.auth.updateUser({
        password: pass
    });

    if (error) {
        console.error(error);
        alert("Error actualizando contraseña.");
        return false;
    }

    alert("Contraseña actualizada correctamente.");
    return true;
}

btnEditarPerfil?.addEventListener("click", async () => {

    if (!editMode) {
        editMode = true;
        bloquearInputs(false);
        btnEditarPerfil.textContent = "GUARDAR";
        btnCerrarSesion.textContent = "CANCELAR";
        return;
    }

    await guardarCambiosPerfil();

    editMode = false;
    bloquearInputs(true);
    btnEditarPerfil.textContent = "EDITAR PERFIL";
    btnCerrarSesion.textContent = "CERRAR SESIÓN";
});

btnEditarContraseña?.addEventListener("click", async () => {

    if (!editMode) {
        editMode = true;
        inputContraseña.value = "";
        inputReContraseña.value = "";
        inputContraseña.type = "text";
        inputReContraseña.style.display = "";
        spanReContraseña.style.display = "";
        btnEditarContraseña.textContent = "GUARDAR";
        btnCerrarSesion.textContent = "CANCELAR";
        return;
    }

    const ok = await guardarNuevaContraseña();
    if (!ok) return;

    editMode = false;
    inputContraseña.type = "password";
    inputReContraseña.style.display = "none";
    spanReContraseña.style.display = "none";
    btnEditarContraseña.textContent = "EDITAR CONTRASEÑA";
    btnCerrarSesion.textContent = "CERRAR SESIÓN";
});

btnCerrarSesion?.addEventListener("click", async (e) => {
    e.preventDefault();

    if (editMode) {
        window.location.href = "perfil.html";
        return;
    }

    if (!confirm("¿Seguro que quieres cerrar sesión?")) return;

    await supabase.auth.signOut();
    window.location.href = "index.html";
});

btnEliminarPerfil?.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!confirm("¿Estás seguro de que quieres eliminar tu perfil? Esta acción no se puede deshacer.")) return;

    /**
     * 🔥 IMPORTANTE
     * Desde el cliente NO podemos borrar auth.users directamente.
     * Eso requiere service_role.
     *
     * Solución correcta:
     * - Crear una Edge Function para eliminar usuario
     *
     * Mientras tanto:
     * Puedes marcarlo como desactivado o avisar.
     */

    alert("Para eliminar completamente el usuario necesitamos una Edge Function (paso siguiente).");
});