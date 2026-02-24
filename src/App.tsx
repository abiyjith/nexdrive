import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/app.css";

/* AUTH */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* REDIRECT */
import RoleRedirect from "./routes/RoleRedirect";

/* CUSTOMER */
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/customer/Home";
import Drivers from "./pages/customer/Drivers";
import Vehicles from "./pages/customer/Vehicles";
import Profile from "./pages/customer/Profile";
import CustomerDashboard from "./pages/dashboards/Customer";
import CustomerBookings from "./pages/customer/Bookings";

/* OWNER */
import OwnerLayout from "./layouts/OwnerLayout";
import OwnerDashboard from "./pages/dashboards/Owner";
import AddVehicle from "./pages/owner/AddVehicle";
import YourVehicles from "./pages/owner/YourVehicles";
import VehicleBookings from "./pages/owner/VehicleBookings";

/* DRIVER */
import DriverLayout from "./layouts/DriverLayout";
import DriverDashboard from "./pages/dashboards/Driver";
import DriverProfile from "./pages/driver/profile";

/* ADMIN */
import AdminLayout from "./pages/dashboards/Admin";
import AdminRequests from "./pages/dashboards/AdminRequests";
import AdminUsers from "./pages/dashboards/AdminUsers";
import AdminDrivers from "./pages/dashboards/AdminDrivers";
import AdminVehicles from "./pages/dashboards/AdminVehicles";
import AdminReports from "./pages/dashboards/AdminReports";

/* GUARD */
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ✅ PUBLIC FIRST */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ ENTRY (after login only) */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<RoleRedirect />} />
        </Route>

        {/* ================= CUSTOMER ================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="home" element={<CustomerHome />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="profile" element={<Profile />} />
            <Route path="/customer/bookings" element={<CustomerBookings />} />
          </Route>
        </Route>

        {/* ================= DRIVER ================= */}
        <Route element={<ProtectedRoute roleRequired="driver" />}>
          <Route path="/driver" element={<DriverLayout />}>
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>
        </Route>

        {/* ================= OWNER ================= */}
        <Route element={<ProtectedRoute roleRequired="owner" />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="addvehicle" element={<AddVehicle />} />
             <Route path="bookings" element={<VehicleBookings />} />
            <Route path="yourvehicles" element={<YourVehicles />} />
          </Route>
        </Route>

        {/* ================= ADMIN ================= */}
        <Route element={<ProtectedRoute roleRequired="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminRequests />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="requests" element={<AdminRequests />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}