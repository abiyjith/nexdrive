import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function RoleRedirect() {

  const { userData } = useAuth()

  if (!userData) return null

  const role = userData.active_role

  if (role === "customer") return <Navigate to="/customer/home" />
  if (role === "driver") return <Navigate to="/driver" />
  if (role === "owner") return <Navigate to="/owner" />
  if (role === "admin") return <Navigate to="/admin" />

  return <Navigate to="/customer/home" />
}
