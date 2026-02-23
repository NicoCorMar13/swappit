/* ========= helpers (si ya tienes load/save/uid, usa los tuyos) ========= */
function load(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
    return (crypto?.randomUUID?.() ?? `g_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}
function norm(s) {
    return String(s || "").trim().toLowerCase();
}

/* =========================================================
1) SEMILLA DE USUARIOS (los de tu captura)
- key: "users"
- unicidad: username (case-insensitive)
========================================================= */
function seedUsers({ overwrite = false } = {}) {
    const seed = [
        { name: "Admin", apellidos: "Admin Admin", username: "superAdmin", email: "admin@admin.es", pass: "admin1" },
        { name: "Jorge", apellidos: "Méndez Méndez", username: "jorgito23", email: "jorge.mm@gmail.com", pass: "JORGEmm1" },
        { name: "Carlos", apellidos: "Gómez", username: "carlossg", email: "carlos@gmail.com", pass: "1234" },
        { name: "Laura", apellidos: "Martínez", username: "lauram", email: "laura@gmail.com", pass: "1234" },
        { name: "David", apellidos: "Ruiz", username: "davidr", email: "david@gmail.com", pass: "1234" },
        { name: "Ana", apellidos: "López", username: "anal0", email: "ana@gmail.com", pass: "1234" },
    ];

    if (overwrite) {
        save("users", seed);
        console.log(`[seedUsers] overwrite: ${seed.length} usuarios`);
        return seed.length;
    }

    const current = load("users", []);
    const existing = new Set(current.map(u => norm(u.username)));

    let added = 0;
    for (const u of seed) {
        const k = norm(u.username);
        if (!k || existing.has(k)) continue;
        current.push(u);
        existing.add(k);
        added++;
    }

    save("users", current);
    console.log(`[seedUsers] añadidos ${added} (total ${current.length})`);
    return added;
}

/* =========================================================
2) SEMILLA DE JUEGOS ALEATORIOS (sin necesidad de perfiles, pero con enlace si los hay)
- key: "games"
- enlace: ownerUsername (si coincide con algún username de users, si no, null)
- campos: id,title,description,platform,condition,ownerUsername,tags,createdAt
========================================================= */
function seedGamesRandom(nPorUsuario = 5, { overwrite = false } = {}) {
    const users = load("users", []);
    if (!users.length) {
        console.warn("[seedGamesRandom] No hay users. Ejecuta seedUsers() primero.");
        return 0;
    }

    const platforms = ["PS5", "PS4", "PS3", "PS2", "PS1", "XBOX ONE", "XBOX 360", "Nintendo Switch", "Nintendo DS", "PC"];
    const conditions = ["Nuevo", "En buen estado", "Usado", "Dañado", "No funcional"];
    const tagPool = ["accion", "aventura", "rpg", "shooter", "cozy", "horror", "indie", "deportes", "carreras", "puzzle", "coop", "openworld", "retro"];

    const titlesA = ["Shadow", "Pixel", "Neon", "Iron", "Crystal", "Turbo", "Dark", "Sky", "Quantum", "Nova", "Dragon", "Cyber", "Silent", "Mystic"];
    const titlesB = ["Riders", "Quest", "Chronicles", "Arena", "Odyssey", "Legends", "Protocol", "Frontier", "Tactics", "Storm", "Fever", "Heist", "Echoes", "Saga"];

    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const makeTitle = () => `${randomItem(titlesA)} ${randomItem(titlesB)} ${randInt(1, 7)}`;
    const makeDesc = (title, platform) =>
        `${title} para ${platform}. Estado bueno. Incluye caja/manual según edición.`;

    const pickTags = () => {
        const count = randInt(1, 3);
        const set = new Set();
        while (set.size < count) set.add(randomItem(tagPool));
        return [...set];
    };

    const normalizeGame = (g) => ({
        id: uid(),
        title: String(g.title || "").trim(),
        description: String(g.description || "").trim(),
        platform: String(g.platform || "").trim(),
        condition: String(g.condition || "").trim(),
        ownerUsername: String(g.ownerUsername || "").trim(),
        tags: Array.isArray(g.tags) ? g.tags.map(t => String(t).trim()).filter(Boolean) : [],
        createdAt: Date.now(),
    });

    const keyOf = (g) => `${norm(g.ownerUsername)}|${norm(g.title)}|${norm(g.platform)}`;

    // si overwrite, reseteamos games
    let current = overwrite ? [] : load("games", []);
    const existingKeys = new Set(current.map(keyOf));

    let added = 0;

    for (const u of users) {
        const ownerUsername = u.username;

        // generamos nPorUsuario juegos por usuario (intentando evitar colisiones)
        let attempts = 0;
        let createdForUser = 0;

        while (createdForUser < nPorUsuario && attempts < nPorUsuario * 10) {
            attempts++;

            const platform = randomItem(platforms);
            const title = makeTitle();
            const game = normalizeGame({
                title,
                description: makeDesc(title, platform),
                platform,
                condition: randomItem(conditions),
                ownerUsername,
                tags: pickTags(),
            });

            const k = keyOf(game);
            if (existingKeys.has(k)) continue;

            current.push(game);
            existingKeys.add(k);
            added++;
            createdForUser++;
        }

        if (createdForUser < nPorUsuario) {
            console.warn(`[seedGamesRandom] ${ownerUsername}: solo se pudieron crear ${createdForUser}/${nPorUsuario} (por duplicados)`);
        }
    }

    save("games", current);
    console.log(`[seedGamesRandom] añadidos ${added} juegos (total ${current.length})`);
    return added;
}

document.addEventListener("DOMContentLoaded", () => {
    const games = load("games", []);
    seedUsers();
    if (games.length === 0) {
        seedGamesRandom(20);
    }
});