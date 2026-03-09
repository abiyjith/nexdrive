import { useEffect,useState } from "react"
import {
collection,
getDocs,
doc,
getDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useNavigate } from "react-router-dom"

export default function AdminVehicleTrips(){

const navigate = useNavigate()

const [trips,setTrips] = useState<any[]>([])
const [selectedTrip,setSelectedTrip] = useState<any>(null)

useEffect(()=>{
loadTrips()
},[])

const loadTrips = async()=>{

const snap = await getDocs(collection(db,"vehicle_bookings"))

const list:any = []

for(const d of snap.docs){

const data = d.data()

let customerName = "Customer"
let vehicleName = "Vehicle"

if(data.customer_id){

const userSnap = await getDoc(doc(db,"users",data.customer_id))

if(userSnap.exists()){
customerName = userSnap.data().first_name
}

}

if(data.vehicle_id){

const vehicleSnap = await getDoc(doc(db,"vehicles",data.vehicle_id))

if(vehicleSnap.exists()){
vehicleName = vehicleSnap.data().brand+" "+vehicleSnap.data().model
}

}

list.push({
id:d.id,
...data,
customerName,
vehicleName
})

}

setTrips(list)

}

return(

<div className="admin-page">

<button
className="back-btn"
onClick={()=>navigate("/admin")}

>

← Back </button>

<h2>Vehicle Trips</h2>

{trips.map(t=>(

<div
key={t.id}
className="admin-card"
onClick={()=>setSelectedTrip(t)}
>

<p><b>Vehicle:</b> {t.vehicleName}</p>
<p><b>Customer:</b> {t.customerName}</p>
<p><b>Status:</b> {t.status}</p>

</div>

))}

{/* POPUP */}

{selectedTrip &&(

<div className="popup-overlay">

<div className="popup-card">

<h3>Trip Details</h3>

<p><b>Vehicle:</b> {selectedTrip.vehicleName}</p>
<p><b>Customer:</b> {selectedTrip.customerName}</p>

<p>
<b>Booking Dates:</b>{" "}
{selectedTrip.start_date} → {selectedTrip.end_date}
</p>

<p><b>Distance:</b> {selectedTrip.distance_travelled} KM</p>

<p><b>Payment Method:</b> {selectedTrip.payment_method}</p>

<p><b>Payment Status:</b> {selectedTrip.payment_status}</p>

<p><b>Total Paid:</b> ₹{selectedTrip.total_price}</p>

<button
className="btn btn-danger"
onClick={()=>setSelectedTrip(null)}

>

Close </button>

</div>

</div>

)}

</div>

)

}
