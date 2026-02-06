import { supabase } from "./supabase";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("first_name, last_name, username, email, role")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}