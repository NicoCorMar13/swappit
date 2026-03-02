import { getMe, getMyProfile } from "./authSupabase.js";

export async function requireAuth({ redirectTo = "index.html" } = {}) {
    const me = await getMe();
    if (!me) {
        window.location.href = redirectTo;
        return null;
    }
    const profile = await getMyProfile(); // {id, username, name, apellidos...}
    return { me, profile };
}

export async function optionalAuth() {
    const me = await getMe();
    if (!me) return null;
    const profile = await getMyProfile();
    return { me, profile };
}