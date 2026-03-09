import { useEffect, useState } from "react"
import {
collection,
query,
where,
getDocs,
getDoc,
doc,
addDoc,
deleteDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"

import "../../styles/ui.css"

export default function Bookings(){

const {user}=useAuth()

const [driverBookings,setDriverBookings]=useState<any[]>([])
const [vehicleBookings,setVehicleBookings]=useState<any[]>([])

useEffect(()=>{
loadDriverBookings()
loadVehicleBookings()
},[])

/* DRIVER BOOKINGS */

const loadDriverBookings=async()=>{

if(!user) return

const q=query(
collection(db,"driver_bookings"),
where("customer_id","==",user.uid)
)

const snap=await getDocs(q)

const list:any[]=[]

for(const d of snap.docs){

const data=d.data()

const driverSnap=await getDoc(doc(db,"users",data.driver_id))

const driverName=driverSnap.exists()
? driverSnap.data().first_name
: "Driver"

const driverEmail=driverSnap.exists()
? driverSnap.data().email
: ""

list.push({
id:d.id,
...data,
driverName,
driverEmail
})

}

setDriverBookings(list)

}

/* VEHICLE BOOKINGS */

const loadVehicleBookings=async()=>{

if(!user) return

const q=query(
collection(db,"vehicle_bookings"),
where("customer_id","==",user.uid)
)

const snap=await getDocs(q)

const list:any[]=[]

for(const d of snap.docs){

const data=d.data()

let vehicleName="Vehicle"

if(data.vehicle_id){

const vSnap=await getDoc(doc(db,"vehicles",data.vehicle_id))

if(vSnap.exists()){
vehicleName=
vSnap.data().brand+" "+vSnap.data().model
}

}

list.push({
id:d.id,
...data,
vehicleName
})

}

setVehicleBookings(list)

}

/* REPORT DRIVER */

const reportDriver=async(driverId:string,bookingId:string)=>{

const reason=prompt("Enter report reason")

if(!reason) return

await addDoc(collection(db,"reports"),{

driver_id:driverId,
customer_id:user?.uid,
booking_id:bookingId,
reason,
created_at:new Date(),
status:"pending"

})

alert("Driver reported")

}

/* DELETE DRIVER BOOKING */

const deleteBooking=async(id:string)=>{

const confirmDelete=window.confirm("Delete this completed booking?")

if(!confirmDelete) return

await deleteDoc(doc(db,"driver_bookings",id))

loadDriverBookings()

}

return(

<div className="page-container">

<h2 className="page-title">Your Bookings</h2>

{/* DRIVER BOOKINGS */}

<h3>Driver Bookings</h3>

<div className="cards-grid">

{driverBookings.length===0 && (
<p>No driver bookings</p>
)}

{driverBookings.map(b=>(

<div className="card" key={b.id}>

<div className="name">
Driver: {b.driverName}
</div>

<p><b>Email:</b> {b.driverEmail}</p>

<p><b>Date:</b> {b.date}</p>

<p>
<b>Status:</b>{" "}
<span className={`status status-${b.status}`}>
{b.status}
</span>
</p>

<p><b>Payment Method:</b> {b.payment_method}</p>

<p><b>Payment Status:</b> {b.payment_status || "pending"}</p>

{b.notify_payment && (

<p style={{color:"#f9a825"}}>
⚠ Driver requested payment. Please pay the driver.
</p>

)}

<p><b>Pickup Location:</b></p>

<button
className="btn btn-success"
onClick={()=>window.open(`https://www.google.com/maps?q=${b.pickup_location}`)}
>
View Pickup Location
</button>

<div className="actions">

<button
className="btn btn-danger"
onClick={()=>reportDriver(b.driver_id,b.id)}
>
Report Driver
</button>

{b.status==="completed" && (

<button
className="btn btn-warning"
onClick={()=>deleteBooking(b.id)}
>
Delete Booking
</button>

)}

</div>

</div>

))}

</div>

{/* VEHICLE BOOKINGS */}

<h3 style={{marginTop:"40px"}}>Vehicle Bookings</h3>

<div className="cards-grid">

{vehicleBookings.length===0 && (
<p>No vehicle bookings</p>
)}

{vehicleBookings.map(b=>(

<div className="card" key={b.id}>

<h3>{b.vehicleName}</h3>

<p><b>Vehicle No:</b> {b.vehicle_number}</p>

<p><b>Date:</b> {b.date}</p>

<p><b>Status:</b> {b.status}</p>

{b.distance_travelled &&(

<p><b>Distance Travelled:</b> {b.distance_travelled} KM</p>

)}

{b.total_price &&(

<p><b>Total Price:</b> ₹{b.total_price}</p>

)}

<p><b>Payment Method:</b> {b.payment_method || "Pending"}</p>

<p><b>Payment Status:</b> {b.payment_status}</p>

{b.notify_payment &&(

<p style={{color:"#f9a825"}}>
⚠ Owner requested payment
</p>

)}

</div>

))}

</div>

</div>

)

}