import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import DashboardNavbar from "../components/DashboardNavbar"

import "../styles/navbar.css"

export default function CustomerLayout(){
    
return(

<>
<DashboardNavbar/>
<Outlet/>
</>

)

const { logout } = useAuth()

return(

<div className="layout">

<nav className="navbar">

<h2 className="logo">NexDrive</h2>

<div className="nav-links">
<Link to="/customer/home">Home</Link>
<Link to="/customer/dashboard">Dashboard</Link>
<Link to="/customer/drivers">Drivers</Link>
<Link to="/customer/vehicles">Vehicles</Link>
<Link to="/customer/bookings">Bookings</Link>
<Link to="/customer/profile">Profile</Link>

<button className="btn btn-danger" onClick={logout}>
Logout
</button>
</div>

</nav>

<div className="page-content">
<Outlet/>
</div>

</div>

)

}
