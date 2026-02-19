const btnEditarContraseña = document.getElementById("btnEditarContraseña");
const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

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