const btnAnadirPerfilFav = document.querySelector(".anadirPerfilFav");

function getFavKey() {
    const session = getSession();
    if (!session?.username) return null;
    return `favoritos_${session.username}`;
}

function loadFavoritos() {
    const key = getFavKey();
    if (!key) return null;

    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveFavoritos(favoritos) {
    const key = getFavKey();
    if (!key) return false;
    localStorage.setItem(key, JSON.stringify(favoritos));
    return true;
}

function actualizarEstadoBoton(usernameOtroPerfil) {
    if (!btnAnadirPerfilFav) return;

    const session = getSession();
    if (usernameOtroPerfil && usernameOtroPerfil ===session.username) {
        alertr("No puedes agregar tu propio perfil a favoritos.");
        return;
    }

    const favoritos = loadFavoritos() || [];
    const esta = favoritos.includes(usernameOtroPerfil);
    btnAnadirPerfilFav.textContent = esta ? "QUITAR DE FAVORITOS" : "AÑADIR PERFIL A FAVORITOS";
    btnAnadirPerfilFav.disabled = false;
    btnAnadirPerfilFav.classList.toggle("enFavoritos", esta);
}

function agregarPerfilAFavoritos(usernnameOtroPerfil) {
    const session = getSession();
    if (!session.username) {
        console.log("nombre de usuario del perfil:", usernnameOtroPerfil);
        console.log("sesión actual:", session);
        alert("Debes iniciar sesión para agregar perfiles a favoritos.");
        return false;
    }

    if (!usernnameOtroPerfil) {
        alert("No se pudo obtener el nombre de usuario del perfil.");
        return false;
    }

    if (usernnameOtroPerfil === session.username) {
        alert("No puedes agregar tu propio perfil a favoritos.");
        return false;
    }

    const users = loadUsers();
    const existe = users.some(u => u.username === usernnameOtroPerfil);
    if (!existe) {
        alert("El perfil que intentas agregar no existe.");
        return false;
    }

    const favoritos = loadFavoritos();
    if (!favoritos) return false;

    if (favoritos.includes(usernnameOtroPerfil)) {
        alert("Este perfil ya está en tus favoritos.");
        return false;
    }

    favoritos.push(usernnameOtroPerfil);
    saveFavoritos(favoritos);
    btnAnadirPerfilFav.textContent = "PERFIL AGREGADO A FAVORITOS";
    btnAnadirPerfilFav.disabled = true;

    alert("Perfil agregado a favoritos correctamente.");
    return true;
}

function actualizarEstadoBoton(usernameOtroPerfil) {
    const usernameNormalizado = usernameOtroPerfil.trim().toLowerCase();
    const favoritos = loadFavoritos();
    if (!favoritos) return;
    const esta = favoritos.includes(usernameNormalizado);

    btnAnadirPerfilFav.textContent = esta ? "QUITAR DE FAVORITOS" : "AÑADIR PERFIL A FAVORITOS";
    btnAnadirPerfilFav.classList.toggle("enFavoritos", esta);
}

function toggleFavorito(usernameOtroPerfil) {
    const session = getSession();
    if (!session.username) {
        alert("Debes iniciar sesión para agregar perfiles a favoritos.");
        return;
    }

    const usernameNormalizado = usernameOtroPerfil.trim().toLowerCase();

    const favoritos = loadFavoritos();
    if (!favoritos) return;

    const index = favoritos.indexOf(usernameNormalizado);
    if (index >= 0) favoritos.splice(index, 1);
    else favoritos.push(usernameNormalizado);

    saveFavoritos(favoritos);
    actualizarEstadoBoton(usernameNormalizado);
}

btnAnadirPerfilFav?.addEventListener("click", (e) => {
    e.preventDefault();
    const usernameOtroPerfil = document.querySelector(".usernameOtroPerfil")?.textContent.trim();
    if (!usernameOtroPerfil) {
        alert("No se pudo obtener el nombre de usuario del perfil.");
        return;
    }
    toggleFavorito(usernameOtroPerfil);
});

document.addEventListener("DOMContentLoaded", () => {
    const usernameOtroPerfil = document.querySelector(".usernameOtroPerfil")?.textContent.trim().toLowerCase();
    if (!usernameOtroPerfil) return;
    actualizarEstadoBoton(usernameOtroPerfil);
});