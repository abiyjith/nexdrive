import { supabase } from "./supabase";

export async function getProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return null;

  // 🔥 FORCE single role source
  return {
    ...data,
    active_role: data.role,
  };
}