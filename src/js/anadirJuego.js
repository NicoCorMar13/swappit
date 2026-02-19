const nombreJuego = document.getElementById("anadirJuego_nombre");
const descripcion = document.getElementById("anadirJuego_descripcion");
const plataforma = document.getElementById("anadirJuego_plataforma");
const estado = document.getElementById("selectorEstado");
const etiquetas = document.getElementById("anadirJuego_etiquetas");

const gid = new URLSearchParams(location.search).get("gid");
const game = findGameById(gid);
if (game) {cargarJuegoParaEdicion();}

function uid() {
    return (crypto?.randomUUID?.() ?? `g_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

function findGameById(gid) {
    const games = load("games", []);
    return games.find(g => String(g.id) === String(gid)) || null;
}

document.getElementById("btnGuardarJuego")?.addEventListener("click", (e) => {
    e.preventDefault();

    const nombreJuego = document.getElementById("anadirJuego_nombre")?.value.trim();
    const descripcion = document.getElementById("anadirJuego_descripcion")?.value;
    const plataforma = document.getElementById("anadirJuego_plataforma")?.value.trim();
    const estado = document.getElementById("selectorEstado")?.value.trim();
    const etiquetas = document.getElementById("anadirJuego_etiquetas")?.value.trim().toLowerCase();

    if (!nombreJuego || !descripcion || !plataforma || !estado || !etiquetas) {
        alert("Completa todos los campos.");
        return;
    }

    const nombreJuegoNormalizado = String(nombreJuego).trim();
    const descripcionNormalizada = String(descripcion).trim();
    const plataformaNormalizada = String(plataforma).trim();
    const estadoNormalizado = String(estado).trim();
    const etiquetasNormalizadas = String(etiquetas).trim().toLowerCase();
    const sesion = load("session");
    const juegos = load("games", []);

    const data = {
        id: uid(),
        title: nombreJuegoNormalizado,
        description: descripcionNormalizada,
        platform: plataformaNormalizada,
        condition: estadoNormalizado,
        ownerUsername: sesion?.username || null,
        tags: etiquetasNormalizadas.split(",").map(t => t.trim()),
        createdAt: Date.now()
    };

    if (game) {
        const idx = juegos.findIndex(g => String(g.id) === String(game.id));
        if (idx === -1) {
            alert("Error: el juego que intentas editar no se encuentra. Se añadirá como nuevo.");
            return;
        }

        juegos[idx] = { 
            ...juegos[idx], 
            ...data, 
            id: juegos[idx].id, 
            ownerUsername: juegos[idx].ownerUsername, 
            createdAt: juegos[idx].createdAt
        };

        localStorage.setItem("games", JSON.stringify(juegos));
        alert("Juego editado correctamente.");
        window.location.href = "misJuegos.html";
        return;
    }

    const nuevoJuego = {
        id: uid(),
        ...data,
        ownerUsername: sesion?.username || null,
        createdAt: Date.now()
    };

    juegos.push(nuevoJuego);
    localStorage.setItem("games", JSON.stringify(juegos));

    alert("Juego añadido correctamente.");
    window.location.href = "misJuegos.html";
});

/*Parte en la que venimos desde la vista de tu juego para editarlo*/
function cargarJuegoParaEdicion() {
    nombreJuego.value = game.title || "";
    descripcion.value = game.description || "";
    plataforma.value = game.platform || "";
    estado.value = game.condition || "";
    etiquetas.value = Array.isArray(game.tags) ? game.tags.join(", ") : (game.tags || "");
}

document.getElementById("btnCancelar")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "misJuegos.html";
    console.log("click cancelar");
});