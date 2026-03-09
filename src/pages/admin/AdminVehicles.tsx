import { useEffect, useState } from "react"
import {
collection,
query,
where,
getDocs,
updateDoc,
doc,
getDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"

import "../../styles/admin.css"

export default function AdminVehicles(){

const [pending,setPending]=useState<any[]>([])
const [approved,setApproved]=useState<any[]>([])
const [loading,setLoading]=useState(true)

useEffect(()=>{
loadVehicles()
},[])

/* LOAD VEHICLES */

const loadVehicles=async()=>{

/* PENDING */

const pendingQuery=query(
collection(db,"vehicles"),
where("status","==","pending")
)

const pendingSnap=await getDocs(pendingQuery)

const pendingList:any=[]

for(const d of pendingSnap.docs){

const data=d.data()

let ownerName="Owner"

if(data.owner_id){

const ownerSnap=await getDoc(doc(db,"users",data.owner_id))

if(ownerSnap.exists()){
ownerName=ownerSnap.data().first_name
}

}

pendingList.push({
id:d.id,
...data,
ownerName
})

}

/* APPROVED */

const approvedQuery=query(
collection(db,"vehicles"),
where("status","==","approved")
)

const approvedSnap=await getDocs(approvedQuery)

const approvedList=approvedSnap.docs.map(d=>({
id:d.id,
...d.data()
}))

setPending(pendingList)
setApproved(approvedList)

setLoading(false)

}

/* APPROVE VEHICLE */

const approveVehicle=async(id:string)=>{

await updateDoc(
doc(db,"vehicles",id),
{
status:"approved",
is_available:true
}
)

alert("Vehicle approved")

loadVehicles()

}

/* REJECT VEHICLE */

const rejectVehicle=async(id:string)=>{

const reason=prompt("Enter rejection reason")

if(!reason) return

await updateDoc(
doc(db,"vehicles",id),
{
status:"rejected",
admin_message:reason
}
)

alert("Vehicle rejected")

loadVehicles()

}

if(loading){
return <p>Loading vehicles...</p>
}

return(

<div className="admin-page">

<h2 className="admin-title">
Vehicle Management
</h2>

{/* PENDING REQUESTS */}

<h3 style={{marginTop:"20px"}}>Pending Vehicle Requests</h3>

<div className="admin-grid">

{pending.length===0 &&(

<p>No pending vehicle requests</p>
)}

{pending.map(v=>(

<div key={v.id} className="admin-card">

<img
src={v.vehicle_image}
style={{
width:"100%",
height:"160px",
objectFit:"cover",
borderRadius:"8px"
}}
/>

<h3>{v.brand} {v.model}</h3>

<p><b>Owner:</b> {v.ownerName}</p>

<p><b>Fuel:</b> {v.fuel}</p>

<p><b>Year:</b> {v.year}</p>

<p><b>Price:</b> ₹{v.price_per_day}</p>

<a
href={v.vehicle_rc}
target="_blank"
rel="noreferrer"
className="btn btn-map"

>

View RC Document

</a>

<div style={{marginTop:"10px"}}>

<button
className="btn btn-success"
onClick={()=>approveVehicle(v.id)}

>

Approve

</button>

<button
className="btn btn-danger"
style={{marginLeft:"10px"}}
onClick={()=>rejectVehicle(v.id)}

>

Reject

</button>

</div>

</div>

))}

</div>

{/* APPROVED VEHICLES */}

<h3 style={{marginTop:"40px"}}>Approved Vehicles</h3>

<div className="admin-grid">

{approved.length===0 &&(

<p>No approved vehicles yet</p>
)}

{approved.map(v=>(

<div key={v.id} className="admin-card">

<img
src={v.vehicle_image}
style={{
width:"100%",
height:"160px",
objectFit:"cover",
borderRadius:"8px"
}}
/>

<h3>{v.brand} {v.model}</h3>

<p><b>Fuel:</b> {v.fuel}</p>

<p><b>Year:</b> {v.year}</p>

<p><b>Price:</b> ₹{v.price_per_day}</p>

<p style={{color:"green"}}>Approved</p>

</div>

))}

</div>

</div>

)

}
