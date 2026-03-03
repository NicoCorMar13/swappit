console.log("main cargado");

import { supabase } from "./supabaseClient.js";
import { getSessionSupabase } from "./session.js";

const authModal = document.getElementById("authModal");
const viewLogged = document.getElementById("viewLogged");
const viewGuest = document.getElementById("viewGuest");

const welcomeText = document.getElementById("welcomeText");
const notMeName = document.getElementById("notMeName");

const btnContinue = document.getElementById("btnContinue");
const btnNotMe = document.getElementById("btnNotMe");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");

window.openModal = function () {
    if (!authModal) return;
    authModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

window.closeModal = function () {
    if (!authModal) return;
    authModal.classList.add("hidden");
    document.body.style.overflow = "";
}

window.showLoginView = function () {
    // mostrar formulario de login
    viewLogged?.classList.add("hidden");
    viewGuest?.classList.remove("hidden");
};

window.showLoggedView = function (nombre = "👋") {
    // mostrar vista logged
    viewGuest?.classList.add("hidden");
    viewLogged?.classList.remove("hidden");
    if (welcomeText) welcomeText.textContent = `Hola ${nombre} 👋`;
    if (notMeName) notMeName.textContent = nombre;
};

// async function renderAuthGate() {
//     if (!authModal) return; // si no existe, no hacemos nada (otras páginas)

//     const s = await getSessionSupabase();
//     const dismissed = sessionStorage.getItem("authModalDismissed") === "1";

//     // Si ya lo cerraste y SIGUES logueado, no molestes
//     if (s?.profile?.id && dismissed) {
//         closeModal();
//         return;
//     }

//     openModal();

//     if (s?.profile?.id) {
//         // Ya logueado: mostrar vista "logged"
//         viewGuest?.classList.add("hidden");
//         viewLogged?.classList.remove("hidden");

//         const nombre = s.profile.name || s.profile.username || "👋";
//         if (welcomeText) welcomeText.textContent = `Hola ${nombre} 👋`;
//         if (notMeName) notMeName.textContent = nombre;
//     } else {
//         // No logueado: mostrar form login
//         viewLogged?.classList.add("hidden");
//         viewGuest?.classList.remove("hidden");
//     }
// }

// Botón: continuar (si está logueado, deja de mostrar modal)
btnContinue?.addEventListener("click", () => {
    sessionStorage.setItem("authModalDismissed", "1");
    closeModal();
    // NO recargamos: index.js ya reacciona con watchAuthChanges y pinta recomendados
});

// Botón: no soy yo → cerrar sesión supabase y volver al login
btnNotMe?.addEventListener("click", async () => {
    sessionStorage.removeItem("authModalDismissed");
    await supabase.auth.signOut();
    await renderAuthGate();
});

// Login real Supabase
loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail?.value.trim().toLowerCase();
    const password = loginPass?.value;

    if (!email || !password) {
        alert("Completa email y contraseña.");
        return;
    }

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        sessionStorage.setItem("authModalDismissed", "1");
        closeModal();
        // NO llamamos renderRecomendados aquí (eso vive en index.js)
    } catch (err) {
        console.error(err);
        alert(err?.message ?? "Error al iniciar sesión");
    }
});

// Mantener modal sincronizado con auth
// supabase.auth.onAuthStateChange(async () => {
//     await renderAuthGate();
// });

// Solo en páginas que tengan authModal (normalmente index)
// document.addEventListener("DOMContentLoaded", renderAuthGate);