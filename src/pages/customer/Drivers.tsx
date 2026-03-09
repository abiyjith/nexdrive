import { useEffect,useState } from "react"
import {
collection,
getDocs,
query,
where,
addDoc,
getDoc,
doc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"
import MapPicker from "../../components/MapPicker"
import "../../styles/ui.css"

export default function Drivers(){

const {user}=useAuth()

const [drivers,setDrivers]=useState<any[]>([])
const [date,setDate]=useState("")
const [location,setLocation]=useState("")

useEffect(()=>{
if(date) loadDrivers()
},[date])

/* LOAD AVAILABLE DRIVERS */

const loadDrivers=async()=>{

if(!date) return

/* drivers available on this date */

const availSnap = await getDocs(
query(
collection(db,"driver_availability"),
where("date","==",date)
)
)

const availableDriverIds = availSnap.docs.map(
d=>d.data().driver_id
)

/* drivers already booked */

const bookingSnap = await getDocs(
query(
collection(db,"driver_bookings"),
where("date","==",date)
)
)

const bookedDriverIds = bookingSnap.docs.map(
d=>d.data().driver_id
)

/* filter available drivers */

const finalDrivers = availableDriverIds.filter(
id => !bookedDriverIds.includes(id)
)

/* fetch driver info */

const list:any=[]

for(const id of finalDrivers){

const userSnap = await getDoc(doc(db,"users",id))

if(userSnap.exists()){

list.push({
id,
...userSnap.data()
})

}

}

setDrivers(list)

}

/* HIRE DRIVER */

const hireDriver=async(driver:any)=>{

if(!date){
alert("Select date")
return
}

if(!location){
alert("Select pickup location")
return
}

await addDoc(collection(db,"driver_bookings"),{

driver_id:driver.id,
customer_id:user?.uid,
customer_email:user?.email,

date,
pickup_location:location,

driver_price: driver.driver_price_per_day || 0,

payment_method:"",
transaction_id:"",
payment_status:"pending",

notify_payment:false,
status:"pending",

created_at:new Date()

})

alert("Driver requested")

loadDrivers()

}

return(

<div className="page-container">

<h2 className="page-title">Hire Drivers</h2>

<div style={{marginBottom:"20px"}}>

<label>Select Date</label>

<input
type="date"
min={new Date().toISOString().split("T")[0]}
value={date}
onChange={(e)=>setDate(e.target.value)}
/>

</div>

<h3>Select Pickup Location</h3>

<MapPicker setLocation={setLocation}/>

<div className="cards-grid" style={{marginTop:"30px"}}>

{drivers.length===0 && (

<p>No drivers available for this date</p>
)}

{drivers.map(driver=>(

<div className="card" key={driver.id}>

<div className="name">
{driver.first_name}
</div>

<p>{driver.email}</p>

<p>
<b>Driver Price:</b>{" "}
₹{driver.driver_price_per_day || "Not Set"} / day
</p>

<button
className="btn btn-success"
disabled={!date || !location}
onClick={()=>hireDriver(driver)}

>

Hire Driver </button>

</div>

))}

</div>

</div>

)

}
