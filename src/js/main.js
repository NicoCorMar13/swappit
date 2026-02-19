console.log("main cargado");

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

// Simula tu “sesión” (luego esto será token/backend)
function getSession() {
    try { return JSON.parse(localStorage.getItem("session")); }
    catch { return null; }
}

function setSession(sessionObj) {
    localStorage.setItem("session", JSON.stringify(sessionObj));
}

function clearSession() {
    localStorage.removeItem("session");
}

function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

function openModal() {
    if (!authModal) return;
    authModal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // bloquea scroll
}

function closeModal() {
    if (!authModal) return;
    authModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function loadUsers() {
    try { return JSON.parse(localStorage.getItem("users")) || []; }
    catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function findUserByEmailOrUsername(raw) {
    const id = String(raw || "").trim().toLowerCase();
    if (!id) return null;

    const users = loadUsers();
    return users.find(u => {
        const email = String(u.email || "").trim().toLowerCase();
        const username = String(u.username || "").trim().toLowerCase();
        return email === id || username === id;
    }) || null;
}

// Lógica principal
function renderAuthGate() {
    const session = getSession();
    const dismissed = sessionStorage.getItem("authModalDismissed") === "1";

    //Si ya se cerró y hay sesión, no molestes mas
    if (session?.name && dismissed) return;

    openModal();

    if (session?.name) {
        // Ya logueado
        viewGuest.classList.add("hidden");
        viewLogged.classList.remove("hidden");

        welcomeText.textContent = `Hola ${session.name} 👋`;
        notMeName.textContent = session.name;
    } else {
        // No logueado
        viewLogged.classList.add("hidden");
        viewGuest.classList.remove("hidden");
    }
}

// Acciones
btnContinue?.addEventListener("click", () => {
    sessionStorage.setItem("authModalDismissed", "1");
    closeModal();
});

btnNotMe?.addEventListener("click", () => {
    clearSession();
    sessionStorage.removeItem("authModalDismissed");
    renderAuthGate(); // vuelve a mostrar login
});

// Login demo (aquí luego llamas a tu backend)
loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const identifier = loginEmail.value.trim();
    const pass = loginPass.value;
    const user = findUserByEmailOrUsername(identifier);

    if (!user) {
        alert("Ese usuario no existe. Regístrate primero.")
        return;
    }

    if (user.pass != pass) {
        alert("Contraseña incorrecta.");
        return;
    }

    setSession({ username: user.username, name: user.name, email: user.email, ts: Date.now() });
    sessionStorage.setItem("authModalDismissed", "1");
    closeModal();
    renderRecomendados();
});

// Llama esto al cargar tu app
document.addEventListener("DOMContentLoaded", () => {
    if (authModal) renderAuthGate();//Solo en index
});