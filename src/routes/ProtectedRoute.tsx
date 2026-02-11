import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ roleRequired }: { roleRequired?: string }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    load();
  }, []);

  // ⛔ CRITICAL: DO NOTHING WHILE LOADING
  if (loading) return null;

  if (!profile) return <Navigate to="/login" replace />;

  if (roleRequired && profile.active_role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}