import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { logout } from "../lib/logout"
import "../styles/navbar.css"
import logo from "../assets/nexdrive-logo.png"

export default function DashboardNavbar(){

const navigate = useNavigate()
const { userData } = useAuth()

if(!userData) return null

const handleLogout = async () => {
await logout()
navigate("/login")
}

return(

<div className="navbar">

<div className="logo-container">
  <img src={logo} className="logo-img" />
  <span className="logo-text">NexDrive</span>
</div>

<div className="nav-links">

{/* CUSTOMER */}

{userData.active_role==="customer" &&(

<>

<button onClick={()=>navigate("/customer")}>
Dashboard </button>

<button onClick={()=>navigate("/customer/drivers")}>
Drivers </button>

<button onClick={()=>navigate("/customer/vehicles")}>
Vehicles </button>

<button onClick={()=>navigate("/customer/bookings")}>
Bookings </button>

<button onClick={()=>navigate("/customer/profile")}>
Profile </button>

</>

)}

{/* DRIVER */}

{userData.active_role==="driver" &&(

<>

<button onClick={()=>navigate("/driver")}>
Dashboard </button>

<button onClick={()=>navigate("/driver/hires")}>
Hires </button>

<button onClick={()=>navigate("/driver/profile")}>
Profile </button>

</>

)}

{/* OWNER */}

{userData.active_role==="owner" &&(

<>

<button onClick={()=>navigate("/owner")}>
Dashboard </button>

<button onClick={()=>navigate("/owner/vehicles")}>
Your Vehicles </button>

<button onClick={()=>navigate("/owner/add-vehicle")}>
Add Vehicle </button>

<button onClick={()=>navigate("/owner/bookings")}>
Bookings </button>

<button onClick={()=>navigate("/owner/profile")}>
Profile</button>

</>

)}

{/* ADMIN */}

{userData.active_role==="admin" &&(

<>

<button onClick={()=>navigate("/admin")}>
Dashboard </button>

<button onClick={()=>navigate("/admin/requests")}>
Requests </button>

<button onClick={()=>navigate("/admin/users")}>
Users </button>

<button onClick={()=>navigate("/admin/reports")}>
Reports </button>

</>

)}

</div>

<div className="nav-right">

<button
className="logout-btn"
onClick={handleLogout}

>

Logout </button>

</div>

</div>

)

}
