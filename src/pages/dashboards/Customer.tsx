import { useAuth } from "../../context/AuthContext"
import { switchRole } from "../../lib/roleHelpers"
import RoleRequest from "../../components/RoleRequest"
import "../../styles/app.css"

export default function CustomerDashboard(){

const { user,userData } = useAuth()

if(!userData) return null

return(

<div className="page">

<h2 className="title">Customer Dashboard</h2>

<div className="grid">

<div className="card">

<h3>Current Role</h3>
<p>{userData.active_role}</p>

</div>

{/* DRIVER */}

<div className="card">

<h3>Driver Role</h3>

{!userData.is_driver && (

<RoleRequest role="driver"/>

)}

{userData.is_driver && (

<button
className="primary-btn"
onClick={()=>switchRole(user!.uid,"driver")}
>

Switch to Driver

</button>

)}

</div>

{/* OWNER */}

<div className="card">

<h3>Owner Role</h3>

{!userData.is_owner && (

<RoleRequest role="owner"/>

)}

{userData.is_owner && (

<button
className="primary-btn"
onClick={()=>switchRole(user!.uid,"owner")}
>

Switch to Owner

</button>

)}

</div>

</div>

</div>

)

}