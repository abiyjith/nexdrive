import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface Props {
  roleRequired?: string
}

export default function ProtectedRoute({ roleRequired }: Props) {

  const { user, userData, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" />
  }

  if (roleRequired && userData?.active_role !== roleRequired) {
    return <Navigate to="/" />
  }

  return <Outlet />
}
