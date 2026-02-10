import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

type Props = {
  roleRequired?: "admin" | "owner" | "customer" | "driver";
};

export default function ProtectedRoute({ roleRequired }: Props) {
  const [status, setStatus] = useState<
    "loading" | "allowed" | "denied"
  >("loading");

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setStatus("denied");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role, is_banned")
        .eq("user_id", session.user.id)
        .single();

      if (!profile || profile.is_banned) {
        await supabase.auth.signOut();
        setStatus("denied");
        return;
      }

      if (roleRequired && profile.active_role !== roleRequired) {
        setStatus("denied");
        return;
      }

      setStatus("allowed");
    };

    check();
  }, [roleRequired]);

  if (status === "loading") {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "30vh" }}>
        Loading...
      </div>
    );
  }

  return status === "allowed" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}