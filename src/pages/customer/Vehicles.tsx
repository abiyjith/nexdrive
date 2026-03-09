import { useEffect, useState } from "react"
import {
collection,
getDocs,
addDoc,
doc,
getDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"

import { DateRange } from "react-date-range"
import { addDays } from "date-fns"

import "../../styles/customer.css"

export default function Vehicles(){

const { user } = useAuth()

const [vehicles,setVehicles] = useState<any[]>([])
const [filteredVehicles,setFilteredVehicles] = useState<any[]>([])
const [loading,setLoading] = useState(true)

const [userLocation,setUserLocation]=useState<any>(null)

/* FILTER STATES */

const [search,setSearch]=useState("")
const [fuelFilter,setFuelFilter]=useState("all")
const [sortPrice,setSortPrice]=useState("")

/* CALENDAR */

const [activeCalendar,setActiveCalendar]=useState<string | null>(null)
const [selectedVehicle,setSelectedVehicle]=useState<any>(null)

const [selectionRange,setSelectionRange]=useState({
startDate:new Date(),
endDate:addDays(new Date(),1),
key:"selection"
})

/* BOOKED DATES */

const [disabledDates,setDisabledDates]=useState<Date[]>([])

/* GET USER LOCATION */

useEffect(()=>{

navigator.geolocation.getCurrentPosition(pos=>{

setUserLocation({
lat:pos.coords.latitude,
lng:pos.coords.longitude
})

})

loadVehicles()

},[])

/* AI DISTANCE */

const calculateDistance=(lat1:any,lng1:any,lat2:any,lng2:any)=>{

const R=6371

const dLat=(lat2-lat1)*Math.PI/180
const dLng=(lng2-lng1)*Math.PI/180

const a=
Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLng/2)*Math.sin(dLng/2)

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))

return R*c

}

/* LOAD VEHICLES */

const loadVehicles = async () => {

try{

const snap = await getDocs(collection(db,"vehicles"))
const list:any=[]

for(const v of snap.docs){

const data=v.data()

if(data.status!=="approved") continue
if(data.is_available===false) continue

let ownerName="Owner"

if(data.owner_id){

const ownerSnap=await getDoc(doc(db,"users",data.owner_id))

if(ownerSnap.exists()){
ownerName=ownerSnap.data().first_name
}

}

let distance=999

if(userLocation && data.location){

const [lat,lng]=data.location.split(",")

distance=calculateDistance(
userLocation.lat,
userLocation.lng,
parseFloat(lat),
parseFloat(lng)
)

}

const aiScore=distance*0.7 + data.price_per_day*0.3

list.push({
id:v.id,
...data,
ownerName,
distance,
aiScore
})

}

list.sort((a:any,b:any)=>a.aiScore-b.aiScore)

setVehicles(list)
setFilteredVehicles(list)

}catch(err){
console.error(err)
}

setLoading(false)

}

/* FILTER */

useEffect(()=>{

let list=[...vehicles]

if(search){

list=list.filter(v=>
(v.brand+" "+v.model)
.toLowerCase()
.includes(search.toLowerCase())
)

}

if(fuelFilter!=="all"){
list=list.filter(v=>v.fuel===fuelFilter)
}

if(sortPrice==="low"){
list.sort((a,b)=>a.price_per_day-b.price_per_day)
}

if(sortPrice==="high"){
list.sort((a,b)=>b.price_per_day-a.price_per_day)
}

setFilteredVehicles(list)

},[search,fuelFilter,sortPrice,vehicles])

/* LOAD BOOKED DATES */

const loadBookedDates = async (vehicleId:string)=>{

const snap=await getDocs(collection(db,"vehicle_bookings"))
const dates: Date[] = []

snap.docs.forEach(d=>{

const data=d.data()

if(data.vehicle_id!==vehicleId) return

if(data.start_date && data.end_date){

let current=new Date(data.start_date)
const end=new Date(data.end_date)

while(current<=end){

dates.push(new Date(current))
current.setDate(current.getDate()+1)

}

}

})

setDisabledDates(dates)

}

/* BOOK VEHICLE */

const bookVehicle = async () => {

if(!selectedVehicle || !user) return

const startDate=selectionRange.startDate
const endDate=selectionRange.endDate

const days=Math.ceil(
(endDate.getTime()-startDate.getTime())/(1000*60*60*24)
)+1

const totalPrice=selectedVehicle.price_per_day*days

await addDoc(collection(db,"vehicle_bookings"),{

vehicle_id:selectedVehicle.id,
vehicle_name:selectedVehicle.brand+" "+selectedVehicle.model,
vehicle_number:selectedVehicle.vehicle_number,

owner_id:selectedVehicle.owner_id,
customer_id:user.uid,
customer_email:user.email,

price_per_day:selectedVehicle.price_per_day,
free_km_per_day:selectedVehicle.free_km_per_day,
extra_price_per_km:selectedVehicle.extra_price_per_km,

start_date:startDate.toISOString().split("T")[0],
end_date:endDate.toISOString().split("T")[0],

days,
total_price:totalPrice,

status:"pending",
payment_status:"pending",
created_at:new Date()

})

alert(`Vehicle booked for ${days} days. Total ₹${totalPrice}`)

setActiveCalendar(null)
setSelectedVehicle(null)

}

/* OPEN MAP */

const openMap=(location:string)=>{
window.open(`https://www.google.com/maps?q=${location}`)
}

if(loading) return <p>Loading vehicles...</p>

return(

<div className="page-container">

<h2 className="page-title">
AI Recommended Vehicles Near You
</h2>

<div className="filter-bar">

<input
placeholder="Search vehicle..."
value={search}
onChange={e=>setSearch(e.target.value)}
/>

<select value={fuelFilter} onChange={e=>setFuelFilter(e.target.value)}>

<option value="all">All Fuel</option>
<option value="petrol">Petrol</option>
<option value="diesel">Diesel</option>
<option value="electric">Electric</option>
</select>

<select value={sortPrice} onChange={e=>setSortPrice(e.target.value)}>

<option value="">Sort Price</option>
<option value="low">Low → High</option>
<option value="high">High → Low</option>
</select>

</div>

<div className="cards-grid">

{filteredVehicles.map(v=>{

const days=Math.ceil(
(selectionRange.endDate.getTime()-selectionRange.startDate.getTime())
/(1000*60*60*24)
)+1

const totalPrice=v.price_per_day*days

return(

<div key={v.id} className="card vehicle-card">

{v.vehicle_image &&(
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

<h3>{v.brand} {v.model}</h3>

<p><b>Vehicle No:</b> {v.vehicle_number}</p>
<p><b>Owner:</b> {v.ownerName}</p>
<p><b>Fuel:</b> {v.fuel}</p>
<p><b>Year:</b> {v.year}</p>

<p><b>Price:</b> ₹{v.price_per_day} / day</p>
<p><b>Total ({days} days):</b> ₹{totalPrice}</p>

<div className="vehicle-actions">

<button
className="btn btn-success"
onClick={()=>{

loadBookedDates(v.id)
setSelectedVehicle(v)
setActiveCalendar(v.id)

}}

>

Select Dates </button>

{v.location &&(
<button
className="btn btn-map"
onClick={()=>openMap(v.location)}

>

View Location </button>
)}

</div>

</div>

)

})}

</div>

{/* CALENDAR POPUP */}

{activeCalendar && selectedVehicle && (

<div
className="calendar-overlay"
onClick={()=>setActiveCalendar(null)}
>

<div
className="calendar-popup"
onClick={(e)=>e.stopPropagation()}
>

<h3 className="calendar-title">
Book {selectedVehicle.brand} {selectedVehicle.model}
</h3>

<DateRange
ranges={[selectionRange]}
onChange={(item:any)=>setSelectionRange(item.selection)}
minDate={new Date()}
disabledDates={disabledDates}
/>

<div className="calendar-actions">

<button
className="btn btn-map"
onClick={()=>setActiveCalendar(null)}

>

Cancel </button>

<button
className="btn btn-success"
onClick={bookVehicle}

>

Confirm Booking </button>

</div>

</div>

</div>

)}

</div>

)

}
