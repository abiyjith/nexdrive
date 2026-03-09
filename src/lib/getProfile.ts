// src/lib/getProfile.ts
// Firebase-based replacement for Supabase getProfile

import { getCurrentUser, getUserProfile } from "./auth";

export async function getProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getUserProfile(user.uid);
  return profile;
}