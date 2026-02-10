import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* AUTH */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* ROLE REDIRECT */
import RoleRedirect from "./routes/RoleRedirect";

/* CUSTOMER */
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/customer/Home";
import Drivers from "./pages/customer/Drivers";
import Vehicles from "./pages/customer/Vehicles";
import Profile from "./pages/customer/Profile";
import CustomerDashboard from "./pages/dashboards/Customer";
import DriverRequests from "./pages/customer/DriverRequests";
import CustomerHistory from "./pages/customer/History";
import CustomerNotifications from "./pages/customer/CustomerNotifications";

/* OWNER */
import OwnerLayout from "./layouts/OwnerLayout";
import OwnerDashboard from "./pages/dashboards/Owner";
import YourVehicles from "./pages/owner/YourVehicles";
import AddVehicle from "./pages/owner/AddVehicle";

/* ADMIN */
import AdminLayout from "./pages/dashboards/Admin";
import AdminRequests from "./pages/dashboards/AdminRequests";
import AdminUsers from "./pages/dashboards/AdminUsers";
import AdminDrivers from "./pages/dashboards/AdminDrivers";
import AdminVehicles from "./pages/dashboards/AdminVehicles";
import AdminReports from "./pages/dashboards/AdminReports";

/* PROTECTED ROUTE */
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔐 ENTRY POINT DECIDES ROLE */}
        <Route path="/" element={<RoleRedirect />} />

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* CUSTOMER / DRIVER */}
        <Route element={<ProtectedRoute />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route path="home" element={<CustomerHome />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="history" element={<CustomerHistory />} />
            <Route path="driver-requests" element={<DriverRequests />} />
            <Route
              path="customer-notifications"
              element={<CustomerNotifications />}
            />
          </Route>
        </Route>

        {/* OWNER */}
        <Route element={<ProtectedRoute roleRequired="owner" />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="vehicles" element={<YourVehicles />} />
            <Route path="add-vehicle" element={<AddVehicle />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute roleRequired="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminRequests />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="vehicles" element={<AdminVehicles />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;