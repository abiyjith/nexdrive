import { useEffect,useState } from "react"
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
import { useAuth } from "../../context/AuthContext"

import "../../styles/owner.css"

export default function YourVehicles(){

const { user } = useAuth()

const [vehicles,setVehicles] = useState<any[]>([])

useEffect(()=>{
loadVehicles()
},[user])

/* LOAD VEHICLES */

const loadVehicles = async()=>{

if(!user) return

const q = query(
collection(db,"vehicles"),
where("owner_id","==",user.uid)
)

const snap = await getDocs(q)

const list:any=[]

for(const d of snap.docs){

const data=d.data()

/* GET BOOKINGS FOR VEHICLE */

let bookingInfo=null

const bookingQuery=query(
collection(db,"vehicle_bookings"),
where("vehicle_id","==",d.id),
where("status","!=","completed")
)

const bookingSnap=await getDocs(bookingQuery)

if(!bookingSnap.empty){

const bookingData=bookingSnap.docs[0].data()

let customerName="Customer"

if(bookingData.customer_id){

const customerSnap=await getDoc(
doc(db,"users",bookingData.customer_id)
)

if(customerSnap.exists()){
customerName=customerSnap.data().first_name
}

}

bookingInfo={
customer_name:customerName,
booking_date:bookingData.date,
total_price:bookingData.price_per_day,
payment_status:bookingData.payment_status
}

}

list.push({
id:d.id,
...data,
bookingInfo
})

}

setVehicles(list)

}

/* REACTIVATE VEHICLE */

const reactivateVehicle = async(id:string)=>{

await updateDoc(
doc(db,"vehicles",id),
{
is_available:true
}
)

alert("Vehicle reactivated")

loadVehicles()

}

/* DEACTIVATE VEHICLE */

const deactivateVehicle = async(id:string)=>{

await updateDoc(
doc(db,"vehicles",id),
{
is_available:false
}
)

alert("Vehicle hidden from customers")

loadVehicles()

}

/* OPEN MAP */

const openMap=(location:string)=>{
window.open(`https://www.google.com/maps?q=${location}`)
}

return(

<div className="vehicles-page">

<h2>Your Vehicles</h2>

<div className="vehicles-grid">

{vehicles.map(v=>(

<div key={v.id} className="vehicle-card">

{/* VEHICLE IMAGE */}

{v.vehicle_image && (

<img
src={v.vehicle_image}
style={{
width:"100%",
height:"160px",
objectFit:"cover",
borderRadius:"8px",
marginBottom:"10px"
}}
/>

)}

{/* BASIC DETAILS */}

<p><b>{v.brand}</b></p>

<p>{v.model}</p>

<p><b>Fuel:</b> {v.fuel}</p>

<p><b>Year:</b> {v.year}</p>

<p><b>Price:</b> ₹{v.price_per_day} / day</p>

{/* LOCATION */}

{v.location &&(

<button
className="btn btn-map"
onClick={()=>openMap(v.location)}

>

View Vehicle Location </button>

)}

{/* ADMIN STATUS */}

<p>

<b>Admin Status:</b>{" "}

{v.status==="pending" && (
<span style={{color:"orange"}}>Pending Approval</span>
)}

{v.status==="approved" && (
<span style={{color:"green"}}>Approved</span>
)}

{v.status==="rejected" && (
<span style={{color:"red"}}>Rejected</span>
)}

</p>

{/* REJECTION MESSAGE */}

{v.status==="rejected" && v.admin_message && (

<p style={{color:"red"}}>

<b>Reason:</b> {v.admin_message}

</p>

)}

{/* VEHICLE VISIBILITY */}

{v.status==="approved" && (

<p>

<b>Visibility:</b>{" "}

{v.is_available
? <span style={{color:"lime"}}>Active (Visible to Customers)</span>
: <span style={{color:"red"}}>Inactive (Hidden)</span>}

</p>

)}

{/* BOOKING INFO */}

{v.bookingInfo && (

<div>

<p><b>Booked By:</b> {v.bookingInfo.customer_name}</p>

<p><b>Booking Date:</b> {v.bookingInfo.booking_date}</p>

<p><b>Total Amount:</b> ₹{v.bookingInfo.total_price}</p>

<p>

<b>Payment Status:</b>{" "}

{v.bookingInfo.payment_status==="paid" ? (
<span style={{color:"green"}}>Paid</span>
):(
<span style={{color:"orange"}}>Pending</span>
)}

</p>

</div>

)}

{/* VISIBILITY CONTROLS */}

{v.status==="approved" && v.is_available && (

<button
className="btn btn-warning"
onClick={()=>deactivateVehicle(v.id)}

>

Deactivate Vehicle

</button>

)}

{v.status==="approved" && !v.is_available && (

<button
className="primary-btn"
onClick={()=>reactivateVehicle(v.id)}

>

Activate Vehicle

</button>

)}

</div>

))}

</div>

</div>

)

}
