import { Routes, Route, Navigate } from "react-router-dom";

/* Auth pages */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* Dashboards */
import CustomerDashboard from "./pages/dashboards/Customer";
import OwnerDashboard from "./pages/dashboards/Owner";
import AdminDashboard from "./pages/dashboards/Admin";
import DriverDashboard from "./pages/dashboards/Driver";

/* Common pages */
import Home from "./pages/Home";
import Rentals from "./pages/Rentals";
import Payments from "./pages/Payments";
import AvailableDrivers from "./pages/AvailableDrivers";

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= COMMON ROUTES ================= */}
      <Route path="/home" element={<Home />} />
      <Route path="/rentals" element={<Rentals />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/drivers" element={<AvailableDrivers />} />

      {/* ================= DASHBOARDS ================= */}
      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/driver" element={<DriverDashboard />} />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}