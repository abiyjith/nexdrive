import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }: any) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAllowed(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("user_id", user.id)
      .single();

    if (profile?.is_banned) {
      alert("Your account has been banned.");
      await supabase.auth.signOut();
      setAllowed(false);
      return;
    }

    setAllowed(true);
  }

  if (allowed === null) return null;

  return allowed ? children : <Navigate to="/login" />;
}