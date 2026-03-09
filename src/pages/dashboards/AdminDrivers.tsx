import { useEffect,useState } from "react"
import {
collection,
getDocs,
deleteDoc,
doc,
getDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useNavigate } from "react-router-dom"

export default function AdminDrivers(){

const navigate = useNavigate()

const [trips,setTrips] = useState<any[]>([])
const [selectedTrip,setSelectedTrip] = useState<any>(null)

useEffect(()=>{
loadTrips()
},[])

const loadTrips = async()=>{

const snap = await getDocs(collection(db,"driver_bookings"))

const list:any=[]

for(const d of snap.docs){

const data=d.data()

let driverName="Driver"
let customerName="Customer"

if(data.driver_id){

const driverSnap = await getDoc(doc(db,"users",data.driver_id))

if(driverSnap.exists()){
driverName = driverSnap.data().first_name
}

}

if(data.customer_id){

const customerSnap = await getDoc(doc(db,"users",data.customer_id))

if(customerSnap.exists()){
customerName = customerSnap.data().first_name
}

}

list.push({
id:d.id,
...data,
driverName,
customerName
})

}

setTrips(list)

}

const deleteTrip = async(id:string)=>{

await deleteDoc(doc(db,"driver_bookings",id))

setTrips(trips.filter(t=>t.id!==id))

}

return(

<div className="admin-page">

<button
className="back-btn"
onClick={()=>navigate("/admin")}

>

← Back </button>

<h2>Driver Trips</h2>

{trips.map(t=>(

<div
key={t.id}
className="admin-card"
onClick={()=>setSelectedTrip(t)}
>

<p><b>Driver:</b> {t.driverName}</p>
<p><b>Customer:</b> {t.customerName}</p>
<p><b>Status:</b> {t.status}</p>

<button
className="danger-btn"
onClick={()=>deleteTrip(t.id)}

>

Delete Trip </button>

</div>

))}

{/* POPUP DETAILS */}

{selectedTrip &&(

<div className="popup-overlay">

<div className="popup-card">

<h3>Driver Trip Details</h3>

<p><b>Driver:</b> {selectedTrip.driverName}</p>
<p><b>Customer:</b> {selectedTrip.customerName}</p>

<p><b>Date:</b> {selectedTrip.date}</p>

<p><b>Pickup Location:</b> {selectedTrip.pickup_location}</p>

<p><b>Payment Method:</b> {selectedTrip.payment_method}</p>

<p><b>Payment Status:</b> {selectedTrip.payment_status}</p>

<p><b>Trip Status:</b> {selectedTrip.status}</p>

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
    