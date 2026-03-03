import { supabase } from "./supabaseClient.js";

export async function signUp({ email, password, username, name, apellidos }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username, name, apellidos }, // va a raw_user_meta_data para el trigger
            emailRedirectTo: "https://cormar13.github.io/swappit/confirm.html"
        }
    });
    if (error) throw error;
    return data;
}

export async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getMe() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
}

export async function getMyProfile() {
    const me = await getMe();
    if (!me) return null;
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", me.id)
        .single();
    if (error) throw error;
    return data;
}