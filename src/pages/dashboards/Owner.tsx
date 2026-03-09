import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { switchRole } from "../../lib/roleHelpers"
import { db } from "../../lib/firebase"
import { doc, getDoc } from "firebase/firestore"

import "../../styles/owner.css"

export default function OwnerDashboard(){

const { user } = useAuth()

const [driverApproved,setDriverApproved] = useState(false)
const [driverPending,setDriverPending] = useState(false)

/* LOAD USER ROLES */

useEffect(()=>{

loadUserRoles()

},[user])

const loadUserRoles = async()=>{

if(!user) return

const snap = await getDoc(doc(db,"users",user.uid))

if(!snap.exists()) return

const data = snap.data()

/* DRIVER ROLE CHECK */

if(data.roles?.includes("driver")){
setDriverApproved(true)
}

if(data.driver_request === "pending"){
setDriverPending(true)
}

}

return(

<div className="page">

<h2 className="title">Owner Dashboard</h2>

<div className="card">

<h3>Switch Role</h3>

<div style={{display:"flex",gap:"10px"}}>

<button
className="primary-btn"
onClick={()=>switchRole(user!.uid,"customer")}

>

Customer Mode </button>

{/* DRIVER ROLE BUTTON */}

{driverApproved && (

<button
className="primary-btn"
onClick={()=>switchRole(user!.uid,"driver")}

>

Driver Mode </button>

)}

{/* DRIVER REQUEST PENDING */}

{!driverApproved && driverPending && (

<span style={{color:"orange",fontWeight:"bold"}}>
Driver Request Pending Approval </span>

)}

</div>

</div>

<div className="card">

<h3>Your Role</h3>

<p>Vehicle Owner</p>

</div>

</div>

)

}
