import { signUp } from "./authSupabase.js";
import { getSessionSupabase } from "./session.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Si ya está logueado, no debería estar aquí
    const s = await getSessionSupabase();
    if (s?.profile?.id) {
        window.location.href = "index.html";
    }
});

document.getElementById("btnSetUsuario")?.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg_nombre")?.value.trim();
    const apellidos = document.getElementById("reg_apellidos")?.value.trim();
    const username = document.getElementById("reg_username")?.value.trim();
    const email = document.getElementById("reg_email")?.value.trim().toLowerCase();
    const password = document.getElementById("reg_contraseña")?.value;

    if (!name || !apellidos || !username || !email || !password) {
        alert("Completa todos los campos.");
        return;
    }

    try {
        const { error } = await signUp({
            email,
            password,
            username,
            name,
            apellidos
        });

        if (error) throw error;

        alert("Registro correcto. Ya puedes iniciar sesión.");
        window.location.href = "index.html";

    } catch (err) {
        console.error(err);

        // Detectar username duplicado (error de índice único en profiles)
        if (err.message?.includes("duplicate key")) {
            alert("Ese nombre de usuario ya está en uso.");
        } else if (err.message?.includes("User already registered")) {
            alert("Ese email ya está registrado.");
        } else {
            alert(err.message || "Error en el registro.");
        }
    }
});

document.getElementById("btnCancelar")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "index.html";
});