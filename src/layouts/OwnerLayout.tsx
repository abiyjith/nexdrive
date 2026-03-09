import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/navbar.css"
import DashboardNavbar from "../components/DashboardNavbar"

export default function OwnerLayout(){
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

<Link to="/owner/dashboard">Dashboard</Link>
<Link to="/owner/addvehicle">Add Vehicle</Link>
<Link to="/owner/yourvehicles">Your Vehicles</Link>
<Link to="/owner/bookings">Bookings</Link>

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