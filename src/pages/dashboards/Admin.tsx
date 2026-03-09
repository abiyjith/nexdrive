import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { logout } from "../../lib/logout"

import { useEffect,useState } from "react"
import {
collection,
getDocs,
query,
where
} from "firebase/firestore"

import { db } from "../../lib/firebase"

import "../../styles/admin.css"

export default function AdminDashboard(){

const navigate = useNavigate()
const { user } = useAuth()

/* =========================
ANALYTICS STATES
========================= */

const [totalUsers,setTotalUsers] = useState(0)
const [totalVehicles,setTotalVehicles] = useState(0)
const [vehicleTrips,setVehicleTrips] = useState(0)
const [driverTrips,setDriverTrips] = useState(0)
const [totalRevenue,setTotalRevenue] = useState(0)

const [pendingRoles,setPendingRoles] = useState(0)
const [pendingVehicles,setPendingVehicles] = useState(0)
const [pendingReports,setPendingReports] = useState(0)

/* =========================
LOAD ANALYTICS
========================= */

useEffect(()=>{
loadAnalytics()
},[])

const loadAnalytics = async()=>{

/* USERS */

const usersSnap = await getDocs(collection(db,"users"))
setTotalUsers(usersSnap.size)

/* VEHICLES */

const vehicleSnap = await getDocs(collection(db,"vehicles"))
setTotalVehicles(vehicleSnap.size)

/* VEHICLE BOOKINGS */

const bookingSnap = await getDocs(collection(db,"vehicle_bookings"))

setVehicleTrips(bookingSnap.size)

let revenue = 0

bookingSnap.docs.forEach(d=>{

const data = d.data()

if(data.payment_status==="paid"){
revenue += Number(data.total_price || 0)
}

})

/* DRIVER BOOKINGS */

const driverSnap = await getDocs(collection(db,"driver_bookings"))

setDriverTrips(driverSnap.size)

/* ROLE REQUESTS */

const roleSnap = await getDocs(
query(
collection(db,"role_requests"),
where("status","==","pending")
)
)

setPendingRoles(roleSnap.size)

/* VEHICLE REQUESTS */

const vehicleReqSnap = await getDocs(
query(
collection(db,"vehicles"),
where("status","==","pending")
)
)

setPendingVehicles(vehicleReqSnap.size)

/* REPORTS */

const reportSnap = await getDocs(collection(db,"reports"))

const pending = reportSnap.docs.filter(
r => r.data().status !== "resolved"
)

setPendingReports(pending.length)

/* TOTAL REVENUE */

setTotalRevenue(revenue)

}

/* =========================
LOGOUT
========================= */

const handleLogout = async()=>{

await logout()
navigate("/login")

}

/* =========================
UI
========================= */

return(

<div className="admin-page">

<div className="admin-header">

<h2 className="admin-title">
Admin Dashboard
</h2>

<button
className="logout-btn"
onClick={handleLogout}

>

Logout </button>

</div>

{/* =========================
ANALYTICS CARDS
========================= */}

<h3 style={{marginBottom:"15px"}}>
Platform Analytics
</h3>

<div className="admin-grid">

<div className="admin-card">
<h3>Total Users</h3>
<p>{totalUsers}</p>
</div>

<div className="admin-card">
<h3>Total Vehicles</h3>
<p>{totalVehicles}</p>
</div>

<div className="admin-card">
<h3>Vehicle Trips</h3>
<p>{vehicleTrips}</p>
</div>

<div className="admin-card">
<h3>Driver Trips</h3>
<p>{driverTrips}</p>
</div>

<div className="admin-card">
<h3>Total Revenue</h3>
<p>₹{totalRevenue}</p>
</div>

</div>

{/* =========================
SYSTEM ALERTS
========================= */}

<h3 style={{marginTop:"40px"}}>
System Alerts
</h3>

<div className="admin-grid">

<div className="admin-card">
<h3>Pending Role Requests</h3>
<p>{pendingRoles}</p>
</div>

<div className="admin-card">
<h3>Vehicle Approvals Pending</h3>
<p>{pendingVehicles}</p>
</div>

<div className="admin-card">
<h3>Open Reports</h3>
<p>{pendingReports}</p>
</div>

</div>

{/* =========================
ADMIN CONTROLS
========================= */}

<h3 style={{marginTop:"40px"}}>
Admin Controls
</h3>

<div className="admin-grid">

<div
className="admin-card"
onClick={()=>navigate("/admin/requests")}
>
<h3>Manage Role Requests</h3>
<p>Approve driver / owner roles</p>
</div>

<div
className="admin-card"
onClick={()=>navigate("/admin/users")}
>
<h3>Users</h3>
<p>Manage users / ban accounts</p>
</div>

<div
className="admin-card"
onClick={()=>navigate("/admin/vehicles")}
>
<h3>Vehicle Requests</h3>
<p>Approve or reject vehicles</p>
</div>

<div
className="admin-card"
onClick={()=>navigate("/admin/drivers")}
>
<h3>Trips</h3>
<p>Driver bookings</p>
</div>

<div
className="admin-card"
onClick={()=>navigate("/admin/vehicle-trips")}
>

<h3>Vehicle Trips</h3>
<p>Monitor vehicle bookings</p>

</div>

<div
className="admin-card"
onClick={()=>navigate("/admin/reports")}
>
<h3>Reports</h3>
<p>View complaints</p>
</div>

</div>

{/* =========================
ADMIN SUPPORT
========================= */}

<div style={{marginTop:"50px"}}>

<h3>Admin Support</h3>

<p>
For issues contact admin:
<b> admin@gmail.com</b>
</p>

</div>

</div>

)

}
