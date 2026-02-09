import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* ================= AUTH ================= */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* ================= CUSTOMER ================= */
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/customer/Home";
import Rentals from "./pages/customer/Rentals";
import Drivers from "./pages/customer/Drivers";
import Profile from "./pages/customer/Profile";
import CustomerDashboard from "./pages/dashboards/Customer";

/* ================= ADMIN ================= */
import AdminLayout from "./pages/dashboards/Admin";
import AdminRequests from "./pages/dashboards/AdminRequests";
import AdminUsers from "./pages/dashboards/AdminUsers";
import AdminDrivers from "./pages/dashboards/AdminDrivers";
import AdminVehicles from "./pages/dashboards/AdminVehicles";

/* ================= ROUTE PROTECTION ================= */
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= DEFAULT ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= PUBLIC ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= CUSTOMER (PROTECTED) ================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<CustomerHome />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
          </Route>
        </Route>

        {/* ================= ADMIN (PROTECTED + ROLE) ================= */}
        <Route element={<ProtectedRoute roleRequired="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminRequests />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="vehicles" element={<AdminVehicles />} />
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;