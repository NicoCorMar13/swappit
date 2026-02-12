console.log("main cargado");

/*====INDEX HTML====*/

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

function findUserByEmail(email) {
    const users = loadUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
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

    const email = loginEmail.value.trim();
    const pass = loginPass.value;
    const user = findUserByEmail(email);

    if (!user) {
        alert("Ese usuario no existe. Regístrate primero.")
        return;
    }

    if (user.pass != pass) {
        alert("Contraseña incorrecta.");
        return;
    }

    setSession({ name: user.name, email: user.email, ts: Date.now() });
    sessionStorage.setItem("authModalDismissed", "1");
    closeModal();
});

// Llama esto al cargar tu app
document.addEventListener("DOMContentLoaded", () => {
    if (authModal) renderAuthGate();//Solo en index
});

/*================*/

/*====REGISTRO HTML====*/

document.getElementById("btnSetUsuario")?.addEventListener("click", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("reg_nombre")?.value.trim();
    const apellidos = document.getElementById("reg_apellidos")?.value.trim();
    const email = document.getElementById("reg_email")?.value.trim().toLowerCase();
    const contraseña = document.getElementById("reg_contraseña")?.value;

    if (!nombre || !apellidos || !email || !contraseña) {
        alert("Completa todos los campos.");
        return;
    }

    const existe = findUserByEmail(email);
    if (existe) {
        alert("Ese email ya está registrado. Inicia sesión.");
        return;
    }

    const usuario = loadUsers();
    usuario.push({ name: nombre, apellidos, email, pass: contraseña });
    saveUsers(usuario);

    alert("Registro OK. Ya puedes iniciar sesión.");
    window.location.href = "index.html";
});

document.getElementById("btnCancelar")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "index.html";
    console.log("click cancelar");
});


/*=====================*/

/*====PERFIL HTML====*/

const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const inputNombre = document.getElementById("perfil_nombre");
const inputApellidos = document.getElementById("perfil_apellidos");
const inputEmail = document.getElementById("perfil_email");
const inputContraseña = document.getElementById("perfil_contraseña");

let editMode = false;

/*cargamos el perfil*/

function cargarPerfil() {

    if (!inputNombre || !inputApellidos || !inputEmail || !inputContraseña || !btnEditarPerfil || !btnCerrarSesion) {
        console.warn("Algo no coincide");
        return;
    }

    const session = getSession();
    if (!session?.email) {
        console.warn("Perfil: no hay sesión o falta session.email");
        return;
    }


    const users = loadUsers();
    console.log("Perfil users:", users);
    const user = users.find(u => u.email === session.email);
    console.log("Perfil user encontrado:", user);

    if (!user) {
        console.warn("Perfil: no existe usuario con ese email en users");
        return;
    }

    inputNombre.value = user.name ?? "";
    inputApellidos.value = user.apellidos ?? "";
    inputEmail.value = user.email ?? "";
    inputContraseña.value = user.pass ?? "";

    bloquearInputs(true);
}

function bloquearInputs(bloquear) {
    inputNombre.disabled = bloquear;
    inputApellidos.disabled = bloquear;
    inputEmail.disabled = bloquear;
    inputContraseña.disabled = bloquear;
}

function guardarCambios() {
    const session = getSession();
    if (!session?.email) return;

    const users = loadUsers();
    const index = users.findIndex(u => u.email === session.email);
    if (index === -1) return;

    const nuevoNombre = inputNombre.value.trim();
    const nuevosApellidos = inputApellidos.value.trim();
    const nuevoEmail = inputEmail.value.trim().toLowerCase();
    const nuevaContraseña = inputContraseña.value.trim();

    if (!nuevoNombre || !nuevosApellidos || !nuevoEmail || !nuevaContraseña) {
        alert("Los campos no pueden estar vacíos.");
        return;
    }

    users[index].name = nuevoNombre;
    users[index].apellidos = nuevosApellidos;
    users[index].email = nuevoEmail;
    users[index].pass = nuevaContraseña;

    saveUsers(users);

    // Si en tu session guardas name, actualízalo aquí también
    const nuevaSession = { ...session, name: nuevoNombre };
    localStorage.setItem("session", JSON.stringify(nuevaSession));

    alert("Perfil actualizado correctamente");
}

btnEditarPerfil?.addEventListener("click", () => {

    if (!editMode) {
        editMode = true;
        bloquearInputs(false);
        btnEditarPerfil.textContent = "GUARDAR";
        btnCerrarSesion.textContent = "CANCELAR";
        inputNombre.focus();
    } else {
        guardarCambios();
        editMode = false;
        bloquearInputs(true);
        btnEditarPerfil.textContent = "EDITAR PERFIL";
        btnCerrarSesion.textContent = "CERRAR SESIÓN";
    }

});

btnCerrarSesion?.addEventListener("click", (e) => {
    e.preventDefault();

    if (!editMode) {
        clearSession();//borra localStorage "session"
        sessionStorage.removeItem("authModalSismissed");//permite que nos vuelva a mostrar el modal
        window.location.href = "index.html";
    } else {
        window.location.href = "perfil.html";
    }
})

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("perfil_nombre")) {
        cargarPerfil();
    }
});


/*===================*/
