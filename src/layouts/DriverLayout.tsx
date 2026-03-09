import { Outlet, Navigate } from "react-router-dom"
import DashboardNavbar from "../components/DashboardNavbar"
import { useAuth } from "../context/AuthContext"

export default function DriverLayout(){

const { userData, loading } = useAuth()

if(loading) return null

/* BLOCK ACCESS IF NOT DRIVER */

if(userData?.active_role !== "driver"){
return <Navigate to="/" />
}

return(

<div>

<DashboardNavbar/>

<div className="page-container">

<Outlet/>

</div>

</div>

)

}
