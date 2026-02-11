import { supabase } from "./supabase";

export async function requestRole(role: "driver" | "owner", licenseUrl: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  return supabase.from("role_requests").insert({
    user_id: auth.user.id,
    requested_role: role,
    status: "pending",
    license_url: licenseUrl
  });
}