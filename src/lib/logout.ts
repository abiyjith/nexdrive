import { supabase } from "./supabase";

export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("active_role");
}