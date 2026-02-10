import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RoleRedirect() {
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    const resolveRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 🚫 NOT LOGGED IN
      if (!session) {
        setDestination("/login");
        setLoading(false);
        return;
      }

      const role = localStorage.getItem("active_role");

      if (role === "admin") setDestination("/admin");
      else if (role === "owner") setDestination("/owner/dashboard");
      else setDestination("/customer/home");

      setLoading(false);
    };

    resolveRole();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "30vh" }}>
        Loading...
      </div>
    );
  }

  return <Navigate to={destination!} replace />;
}