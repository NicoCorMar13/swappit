const btnEditarContraseña = document.getElementById("btnEditarContraseña");
const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const btnEliminarPerfil = document.getElementById("btnEliminarPerfil");

const spanReContraseña = document.querySelector(".perfil_recontraseña");

const inputUsername = document.getElementById("perfil_username");
const inputNombre = document.getElementById("perfil_nombre");
const inputApellidos = document.getElementById("perfil_apellidos");
const inputEmail = document.getElementById("perfil_email");
const inputContraseña = document.getElementById("perfil_contraseña");
const inputReContraseña = document.getElementById("perfil_recontraseña");

let editMode = false;

/*cargamos el perfil*/

function cargarPerfil() {

    if (!inputUsername || !inputNombre || !inputApellidos || !inputEmail || !inputContraseña || !btnEditarPerfil || !btnCerrarSesion) {
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

    inputUsername.value = user.username ?? "";
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

function guardarContraseña() {
    const session = getSession();
    if (!session?.email) return false;

    const users = loadUsers();
    const index = users.findIndex(u => u.email === session.email);
    if (index === -1) return false;

    const nuevaContraseña = inputContraseña.value.trim();
    const contraseñaActual = users[index].pass;

    if (nuevaContraseña === contraseñaActual) {
        alert("La nueva contraseña no puede ser igual a la actual.");
        return false;
    }

    if (!nuevaContraseña) {
        alert("La contraseña no puede estar vacía.");
        return false;
    }

    users[index].pass = nuevaContraseña;
    saveUsers(users);

    alert("Contraseña actualizada correctamente");
    return true;
}

btnEditarContraseña?.addEventListener("click", () => {
    if (!confirm("¿Estás seguro de que quieres editar tu contraseña? Se mostrará la contraseña por pantalla.")) return;
    if (!editMode) {
        editMode = true;
        btnEditarPerfil.style.display = "none";
        btnEditarContraseña.textContent = "GUARDAR";
        btnCerrarSesion.textContent = "CANCELAR";
        btnCerrarSesion.style.backgroundColor = "red";
        btnCerrarSesion.style.color = "white";
        inputContraseña.disabled = false;
        inputReContraseña.disabled = false;
        inputContraseña.type = "text";
        inputReContraseña.type = "text";
        inputReContraseña.style.display = "";
        spanReContraseña.style.display = "";
        inputContraseña.focus();
    } else {
        if (inputContraseña.value !== inputReContraseña.value) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const guardado = guardarContraseña();

        if (!guardado) return;

        btnEditarPerfil.style.display = "";
        editMode = false;
        btnEditarContraseña.textContent = "EDITAR CONTRASEÑA";
        btnCerrarSesion.textContent = "CERRAR SESIÓN";
        btnCerrarSesion.style.backgroundColor = "rgb(155, 196, 243)";
        btnCerrarSesion.style.color = "black";
        inputContraseña.disabled = true;
        inputContraseña.type = "password";
        inputReContraseña.style.display = "none";
        spanReContraseña.style.display = "none";
        inputReContraseña.disabled = true;
    }
});

btnEditarPerfil?.addEventListener("click", () => {

    if (!editMode) {
        editMode = true;
        bloquearInputs(false);
        btnEditarContraseña.style.display = "none";
        btnEditarPerfil.textContent = "GUARDAR";
        btnCerrarSesion.textContent = "CANCELAR";
        btnCerrarSesion.style.backgroundColor = "red";
        btnCerrarSesion.style.color = "white";
        inputNombre.focus();
    } else {
        btnEditarContraseña.style.display = "";
        guardarCambios();
        editMode = false;
        bloquearInputs(true);
        btnEditarPerfil.textContent = "EDITAR PERFIL";
        btnCerrarSesion.textContent = "CERRAR SESIÓN";
        btnCerrarSesion.style.backgroundColor = "rgb(155, 196, 243)";
        btnCerrarSesion.style.color = "black";
    }

});

btnCerrarSesion?.addEventListener("click", (e) => {
    e.preventDefault();

    if (!editMode) {
        if (!confirm("¿Estás seguro de que quieres cerrar sesión?")) return;
        clearSession();//borra localStorage "session"
        sessionStorage.removeItem("authModalSismissed");//permite que nos vuelva a mostrar el modal
        window.location.href = "index.html";
    } else {
        window.location.href = "perfil.html";
    }
})

btnEliminarPerfil?.addEventListener("click", (e) => {
    e?.preventDefault?.();

    if (!confirm("¿Estás seguro de que quieres eliminar tu perfil? Esta acción no se puede deshacer.")) return;

    const session = getSession();
    if (!session) return;

    const myEmail = String(session.email || "").trim().toLowerCase();
    const myUsername = String(session.username || "").trim().toLowerCase();

    if (!myEmail || !myUsername) {
        alert("No se pudo identificar correctamente la sesión (email/username).");
        return;
    }

    // Helpers genéricos (si ya tienes load/save globales, puedes quitar esto)
    const load = (key, fallback) => {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch { return fallback; }
    };
    const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

    // 1) BORRAR USUARIO DE "users"
    const users = loadUsers(); // tu función
    const idx = users.findIndex(u => String(u.email || "").trim().toLowerCase() === myEmail);
    if (idx === -1) return;

    // Nos guardamos el username “real” por si en users lo tienes con mayúsculas
    const usernameReal = String(users[idx].username || session.username || "").trim();
    const usernameRealLC = usernameReal.toLowerCase();

    users.splice(idx, 1);
    saveUsers(users); // tu función

    // 2) BORRAR SUS JUEGOS DE "games"
    const games = load("games", []);
    const myGameIds = new Set(
        games
            .filter(g => String(g.ownerUsername || "").trim().toLowerCase() === usernameRealLC)
            .map(g => String(g.id))
    );

    const gamesFiltrados = games.filter(
        g => String(g.ownerUsername || "").trim().toLowerCase() !== usernameRealLC
    );
    save("games", gamesFiltrados);

    // 3) RECORRER localStorage PARA LIMPIAR FAVORITOS/LIKES DE OTROS
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // 3.a) Favoritos de perfiles: favoritos_<alguien> guarda usernames
        if (key.startsWith("favoritos_")) {
            const favUsers = load(key, []);
            if (Array.isArray(favUsers)) {
                const nuevo = favUsers.filter(u => String(u).trim().toLowerCase() !== usernameRealLC);
                // Solo guarda si cambió
                if (nuevo.length !== favUsers.length) save(key, nuevo);
            }
            continue;
        }

        // 3.b) Likes de juegos: likes_games_<alguien> guarda IDs de juegos
        if (key.startsWith("likes_games_")) {
            const liked = load(key, []);
            if (Array.isArray(liked) && myGameIds.size > 0) {
                const nuevo = liked.filter(id => !myGameIds.has(String(id)));
                if (nuevo.length !== liked.length) save(key, nuevo);
            }
            continue;
        }

        // Si tienes más tablas por usuario (chats_, notifs_, etc.), aquí es donde se añadirían.
    }

    // 4) BORRAR SUS PROPIAS LISTAS (por si acaso quedan)
    localStorage.removeItem(`favoritos_${usernameReal}`);
    localStorage.removeItem(`favoritos_${usernameRealLC}`);
    localStorage.removeItem(`likes_games_${usernameReal}`);
    localStorage.removeItem(`likes_games_${usernameRealLC}`);

    // 5) CERRAR SESIÓN Y REDIRIGIR
    clearSession(); // tu función
    window.location.href = "index.html";
});

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("perfil_nombre")) {
        cargarPerfil();
    }
});