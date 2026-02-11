import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zuqmkwgxldoqdostbshe.supabase.co";
const supabaseAnonKey = "sb_publishable_sfFwYKC3lxHNE7P1pQWahg_iEz7fEAW";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);