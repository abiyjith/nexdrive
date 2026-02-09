import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  roleRequired?: string;
}

export default function ProtectedRoute({ roleRequired }: ProtectedRouteProps) {
  const role = localStorage.getItem("role");

  // ❌ Not logged in
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but wrong role (admin protection)
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authorized → allow nested routes
  return <Outlet />;
}