import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
    "TU_SUPABASE_URL",
    "TU_SUPABASE_ANON_KEY"
);