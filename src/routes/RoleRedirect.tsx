import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function RoleRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("user_id", auth.user.id)
        .single();

      if (!profile) {
        navigate("/login");
        return;
      }

      switch (profile.active_role) {
        case "admin":
          navigate("/admin");
          break;
        case "owner":
          navigate("/owner/dashboard");
          break;
        case "driver":
          navigate("/driver/dashboard");
          break;
        default:
          navigate("/customer/dashboard");
      }
    };

    redirect();
  }, [navigate]);

  return null;
}