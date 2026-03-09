import { useEffect,useState } from "react"
import { collection,getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function AdminVehicles(){

const [trips,setTrips] = useState<any[]>([])

useEffect(()=>{

const load = async()=>{

const snap = await getDocs(collection(db,"vehicle_bookings"))

setTrips(
snap.docs.map(d=>({id:d.id,...d.data()}))
)

}

load()

},[])

return(

<div>

<h2>Vehicle Trips</h2>

{trips.map(t=>(

<div key={t.id}>

<p>Vehicle: {t.vehicle_id}</p>
<p>Customer: {t.customer_id}</p>

</div>

))}

</div>

)

}