import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import "./styles/app.css"

/* AUTH */
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"

/* ROUTES */
import ProtectedRoute from "./routes/ProtectedRoute"
import RoleRedirect from "./routes/RoleRedirect"

/* CUSTOMER */
import CustomerLayout from "./layouts/CustomerLayout"
import CustomerDashboard from "./pages/dashboards/Customer"
import CustomerHome from "./pages/customer/Home"
import Drivers from "./pages/customer/Drivers"
import Vehicles from "./pages/customer/Vehicles"
import Profile from "./pages/customer/Profile"
import CustomerBookings from "./pages/customer/Bookings"

/* DRIVER */
import DriverLayout from "./layouts/DriverLayout"
import DriverDashboard from "./pages/dashboards/Driver"
import DriverProfile from "./pages/driver/profile"
import DriverHires from "./pages/driver/Hires"

/* OWNER */
import OwnerLayout from "./layouts/OwnerLayout"
import OwnerDashboard from "./pages/dashboards/Owner"
import AddVehicle from "./pages/owner/AddVehicle"
import YourVehicles from "./pages/owner/YourVehicles"
import VehicleBookings from "./pages/owner/VehicleBookings"
import OwnerProfile from "./pages/owner/Profile"

/* ADMIN */
import AdminVehicleTrips from "./pages/admin/AdminVehicleTrips"
import AdminLayout from "./layouts/AdminLayout"
import AdminDashboard from "./pages/dashboards/Admin"
import AdminRequests from "./pages/admin/AdminRequests"
import AdminUsers from "./pages/dashboards/AdminUsers"
import AdminVehicles from "./pages/admin/AdminVehicles"
import AdminReports from "./pages/dashboards/AdminReports"
import AdminDrivers from "./pages/dashboards/AdminDrivers"


export default function App(): JSX.Element {

return (

<Router>

<Routes>

{/* PUBLIC */}

<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

{/* ROOT */}

<Route element={<ProtectedRoute />}>

<Route path="/" element={<RoleRedirect />} />

</Route>

{/* CUSTOMER */}

<Route element={<ProtectedRoute roleRequired="customer" />}>

<Route path="/customer" element={<CustomerLayout />}>

<Route index element={<CustomerDashboard />} />

<Route path="dashboard" element={<CustomerDashboard />} />

<Route path="home" element={<CustomerHome />} />

<Route path="drivers" element={<Drivers />} />

<Route path="vehicles" element={<Vehicles />} />

<Route path="profile" element={<Profile />} />

<Route path="bookings" element={<CustomerBookings />} />

</Route>

</Route>

{/* DRIVER */}

<Route element={<ProtectedRoute roleRequired="driver" />}>

<Route path="/driver" element={<DriverLayout />}>

<Route index element={<DriverDashboard />} />

<Route path="dashboard" element={<DriverDashboard />} />

<Route path="profile" element={<DriverProfile />} />

<Route path="hires" element={<DriverHires />} />

</Route>

</Route>

{/* OWNER */}

<Route element={<ProtectedRoute roleRequired="owner" />}>

  <Route path="/owner" element={<OwnerLayout />}>

    <Route index element={<OwnerDashboard />} />

    <Route path="profile" element={<OwnerProfile />} />

    <Route path="vehicles" element={<YourVehicles />} />

    <Route path="add-vehicle" element={<AddVehicle />} />

    <Route path="bookings" element={<VehicleBookings />} />

  </Route>

</Route>

 {/* ADMIN */}

<Route element={<ProtectedRoute roleRequired="admin" />}>

<Route path="/admin" element={<AdminDashboard />} />

<Route path="/admin/requests" element={<AdminRequests />} />

<Route path="/admin/users" element={<AdminUsers />} />

<Route path="/admin/drivers" element={<AdminDrivers />} />

<Route path="/admin/vehicles" element={<AdminVehicles />} />

<Route path="/admin/vehicle-trips" element={<AdminVehicleTrips />} />

<Route path="/admin/reports" element={<AdminReports />} />

</Route>

</Routes>

</Router>

)

}