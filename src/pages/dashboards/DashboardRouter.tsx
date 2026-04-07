import { useAuth } from "../../context/AuthContext"

import CustomerDashboard from "./Customer"
import OwnerDashboard from "./Owner"
import DriverDashboard from "./Driver"
import AdminDashboard from "./Admin"

export default function DashboardRouter() {

  const { userData } = useAuth()

  if (!userData) return null

  const role = userData.active_role || "customer"

  switch (role) {

    case "admin":
      return <AdminDashboard />

    case "owner":
      return <OwnerDashboard />

    case "driver":
      return <DriverDashboard />

    default:
      return <CustomerDashboard />
  }

}
