import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RoleRedirect() {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Not logged in
      if (!session?.user) {
        setRedirectTo("/login");
        setLoading(false);
        return;
      }

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        setRedirectTo("/login");
        setLoading(false);
        return;
      }

      // Role-based redirect
      switch (profile.active_role) {
        case "admin":
          setRedirectTo("/admin");
          break;
        case "owner":
          setRedirectTo("/owner/dashboard");
          break;
        case "driver":
        case "customer":
        default:
          setRedirectTo("/customer/dashboard");
      }

      setLoading(false);
    };

    resolve();
  }, []);

  if (loading) return null;

  return redirectTo ? <Navigate to={redirectTo} replace /> : null;
}