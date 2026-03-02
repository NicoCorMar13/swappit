import { supabase } from "./supabaseClient.js";
import { getMyProfile } from "./authSupabase.js";

/**
 * Devuelve { me, profile } o null
 */
export async function getSessionSupabase() {
    const { data } = await supabase.auth.getSession();
    const session = data?.session ?? null;
    if (!session?.user) return null;

    const me = session.user;
    const profile = await getMyProfile(); // lee public.profiles por id
    return { me, profile };
}

/**
 * En páginas protegidas:
 * - si NO hay sesión -> abre tu modal/ventana login (o redirige)
 * - si hay sesión -> ejecuta onAuthed
 */
export async function requireSession({ onAuthed, onNoSession, redirectTo } = {}) {
    const s = await getSessionSupabase();

    if (!s) {
        if (typeof onNoSession === "function") onNoSession();
        else if (redirectTo) window.location.href = redirectTo;
        return null;
    }

    if (typeof onAuthed === "function") await onAuthed(s);
    return s;
}

/**
 * Útil para index: si hay sesión, cambia UI; si no, deja UI de invitado
 * Además, reacciona a login/logout sin recargar
 */
export function watchAuthChanges({ onLogin, onLogout } = {}) {
    supabase.auth.onAuthStateChange(async (_event, _session) => {
        const s = await getSessionSupabase();
        if (s) onLogin?.(s);
        else onLogout?.();
    });
}