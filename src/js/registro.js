document.getElementById("btnSetUsuario")?.addEventListener("click", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("reg_nombre")?.value.trim();
    const apellidos = document.getElementById("reg_apellidos")?.value.trim();
    const username = document.getElementById("reg_username")?.value.trim();
    const email = document.getElementById("reg_email")?.value.trim().toLowerCase();
    const contraseña = document.getElementById("reg_contraseña")?.value;

    if (!nombre || !apellidos || !username || !email || !contraseña) {
        alert("Completa todos los campos.");
        return;
    }

    const usernameNormalizado = String(username).toLowerCase();
    const emailNormalizado = String(email).toLowerCase();
    const usuario = loadUsers();

    const emailExistente = usuario.some(u => String(u.email || "").toLowerCase() === emailNormalizado);
    if (emailExistente) {
        alert("Ya existe una cuenta con ese email.");
        return;
    }

    const usernameExistente = usuario.some(u => String(u.username || "").toLowerCase() === usernameNormalizado);
    if (usernameExistente) {
        alert("Ya existe una cuenta con ese nombre de usuario.");
        return;
    }

    usuario.push({ name: nombre, apellidos, username: username, email: email, pass: contraseña });
    saveUsers(usuario);

    alert("Registro OK. Ya puedes iniciar sesión.");
    window.location.href = "index.html";
});

document.getElementById("btnCancelar")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "index.html";
    console.log("click cancelar");
});