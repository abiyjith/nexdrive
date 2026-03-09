import { Link,Outlet,useNavigate } from "react-router-dom"
import { logout } from "../lib/logout"

import "../styles/navbar.css"
import "../styles/app.css"

export default function AdminLayout(){

const navigate = useNavigate()

const handleLogout = async ()=>{

await logout()

navigate("/login")

}

return(

<div>

<nav className="navbar">

<div
className="logo"
onClick={()=>navigate("/admin")}
>

NexDrive Admin

</div>

<div className="nav-links">

<Link to="/admin">Dashboard</Link>

<Link to="/admin/requests">Requests</Link>

<Link to="/admin/users">Users</Link>

<Link to="/admin/drivers">Trips</Link>

<Link to="/admin/vehicles">Vehicles</Link>

<Link to="/admin/reports">Reports</Link>

<button
className="logout-btn"
onClick={handleLogout}

>

Logout

</button>

</div>

</nav>

<div className="page">

<Outlet/>

</div>

</div>

)

}
