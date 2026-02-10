import { Navigate } from "react-router-dom";

export default function RoleRedirect() {
  const role = localStorage.getItem("active_role");

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "owner") return <Navigate to="/owner/dashboard" replace />;
  if (role === "customer" || role === "driver")
    return <Navigate to="/customer/home" replace />;

  return <Navigate to="/login" replace />;
}