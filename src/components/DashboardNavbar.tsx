import { useEffect, useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../lib/logout";
import { motion } from "framer-motion";
import { 
  FaHome, FaCarAlt, FaUserTie, FaMapMarkedAlt, 
  FaUserCircle, FaSignOutAlt, FaPlus, FaChartPie, 
  FaClipboardList, FaShieldAlt, FaExclamationTriangle,
  FaSun, FaMoon
} from "react-icons/fa";
import "../styles/navbar.css";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (!userData) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="navbar-wrapper">
      <motion.nav 
        className="navbar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link to="/" className="logo-container" style={{ padding: '0', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="animated-logo-icon"><FaCarAlt /></div>
          <span className="animated-gradient-text">NexDrive</span>
        </Link>

        <div className="nav-links">
          {/* CUSTOMER */}
          {userData.active_role === "customer" && (
            <>
              <NavLink to="/customer/home" className="nav-btn"><FaHome /> Home</NavLink>
              <NavLink to="/customer" end className="nav-btn"><FaChartPie /> Dashboard</NavLink>
              <NavLink to="/customer/drivers" className="nav-btn"><FaUserTie /> Drivers</NavLink>
              <NavLink to="/customer/vehicles" className="nav-btn"><FaCarAlt /> Vehicles</NavLink>
              <NavLink to="/customer/bookings" className="nav-btn"><FaMapMarkedAlt /> Bookings</NavLink>
              <NavLink to="/customer/profile" className="nav-btn"><FaUserCircle /> Profile</NavLink>
            </>
          )}

          {/* DRIVER */}
          {userData.active_role === "driver" && (
            <>
              <NavLink to="/driver" end className="nav-btn"><FaChartPie /> Dashboard</NavLink>
              <NavLink to="/driver/hires" className="nav-btn"><FaMapMarkedAlt /> Hires</NavLink>
              <NavLink to="/driver/profile" className="nav-btn"><FaUserCircle /> Profile</NavLink>
            </>
          )}

          {/* OWNER */}
          {userData.active_role === "owner" && (
            <>
              <NavLink to="/owner" end className="nav-btn"><FaChartPie /> Dashboard</NavLink>
              <NavLink to="/owner/vehicles" className="nav-btn"><FaCarAlt /> Your Vehicles</NavLink>
              <NavLink to="/owner/add-vehicle" className="nav-btn"><FaPlus /> Add Vehicle</NavLink>
              <NavLink to="/owner/bookings" className="nav-btn"><FaClipboardList /> Bookings</NavLink>
              <NavLink to="/owner/profile" className="nav-btn"><FaUserCircle /> Profile</NavLink>
            </>
          )}

          {/* ADMIN */}
          {userData.active_role === "admin" && (
            <>
              <NavLink to="/admin" end className="nav-btn"><FaChartPie /> Dashboard</NavLink>
              <NavLink to="/admin/requests" className="nav-btn"><FaClipboardList /> Requests</NavLink>
              <NavLink to="/admin/users" className="nav-btn"><FaUserTie /> Users</NavLink>
              <NavLink to="/admin/reports" className="nav-btn"><FaExclamationTriangle /> Reports</NavLink>
            </>
          )}
        </div>

        <div className="nav-right">
          <button 
            className="nav-btn" 
            style={{ padding: '8px', fontSize: '18px', display: 'flex' }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          
          <div className="nav-profile-info">
            <span className="nav-user-name">{userData.first_name} {userData.last_name}</span>
            <span className="nav-user-role">{userData.active_role}</span>
          </div>
          <button 
            className="logout-btn-icon" 
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </motion.nav>
    </div>
  );
}
