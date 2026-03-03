import { supabase } from "./supabaseClient.js";
import { getMyProfile } from "./authSupabase.js";

/**
 * Devuelve { me, profile } o null
 */
export async function getSessionSupabase() {
    const { data } = await supabase.auth.getSession();
    const session = data?.session ?? null;
    if (!session?.user) return null;

    const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

    return { session, profile: profile ?? null };
}

/**
 * En páginas protegidas:
 * - si NO hay sesión -> abre tu modal/ventana login (o redirige)
 * - si hay sesión -> ejecuta onAuthed
 */
export async function requireSession({ onAuthed, onNoSession } = {}) {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    console.log("requireSession session?", !!session);

    if (!session?.user?.id) {
        onNoSession?.();
        return null;
    }

    //Si hay auth session, trae perfil
    const s = await getSessionSupabase();
    if (!s?.profile?.id) {
        //Hay sesion pero no perfil (raro), trátalo como no-session o maneja error
        onNoSession?.();
        return null;
    }

    await onAuthed?.({ session: s.session, profile: s.profile });
    return s;
}

/**
 * Útil para index: si hay sesión, cambia UI; si no, deja UI de invitado
 * Además, reacciona a login/logout sin recargar
 */
export function watchAuthChanges({ onLogin, onLogout } = {}) {
    supabase.auth.onAuthStateChange(async (event) => {
        if (event === "SIGNED_IN") {
            await onLogin?.();
        }
        if (event == "SIGNED_OUT") {
            onLogout?.();
        }
    });
}