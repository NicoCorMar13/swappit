import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://cqnnxxcymelkwlcywokz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbm54eGN5bWVsa3dsY3l3b2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzE1OTMsImV4cCI6MjA4NDU0NzU5M30.20Gv9evX-N5YdO0rNMMhj1RWw_wrpHV9CHpa3t2znxs";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
        },
    }
);