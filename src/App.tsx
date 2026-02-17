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

/* OWNER */
import OwnerLayout from "./layouts/OwnerLayout";
import OwnerDashboard from "./pages/dashboards/Owner";

/* DRIVER */
import DriverLayout from "./layouts/DriverLayout";
import DriverDashboard from "./pages/dashboards/Driver";
import DriverProfile from "./pages/driver/profile";

/* ADMIN */
import AdminLayout from "./pages/dashboards/Admin";
import AdminRequests from "./pages/dashboards/AdminRequests";

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
          </Route>
        </Route>

        {/* ================= ADMIN ================= */}
        <Route element={<ProtectedRoute roleRequired="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="requests" element={<AdminRequests />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}