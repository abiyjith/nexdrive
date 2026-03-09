import { useEffect,useState } from "react"
import {
collection,
query,
where,
getDocs,
doc,
getDoc,
updateDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"

import "../../styles/owner.css"

export default function VehicleBookings(){

const { user } = useAuth()

const [bookings,setBookings] = useState<any[]>([])
const [totalEarnings,setTotalEarnings] = useState(0)

useEffect(()=>{
loadBookings()
},[])

/* LOAD BOOKINGS */

const loadBookings = async()=>{

if(!user) return

const q = query(
collection(db,"vehicle_bookings"),
where("owner_id","==",user.uid)
)

const snap = await getDocs(q)

const list:any=[]
let earnings=0

for(const d of snap.docs){

const data=d.data()

/* CUSTOMER NAME */

let customerName="Customer"

if(data.customer_id){

const customerSnap=await getDoc(
doc(db,"users",data.customer_id)
)

if(customerSnap.exists()){
customerName=customerSnap.data().first_name
}

}

/* VEHICLE INFO */

let vehicleName="Vehicle"
let freeKm=0
let extraPrice=0

if(data.vehicle_id){

const vehicleSnap=await getDoc(
doc(db,"vehicles",data.vehicle_id)
)

if(vehicleSnap.exists()){

vehicleName =
vehicleSnap.data().brand+" "+vehicleSnap.data().model

freeKm=vehicleSnap.data().free_km_per_day || 0
extraPrice=vehicleSnap.data().extra_price_per_km || 0

}

}

/* EARNINGS */

if(data.payment_status==="paid"){
earnings+=Number(data.total_price || data.price_per_day)
}

list.push({
id:d.id,
...data,
customerName,
vehicleName,
freeKm,
extraPrice
})

}

setBookings(list)
setTotalEarnings(earnings)

}

/* ENTER DISTANCE */

const enterDistance = async(b:any)=>{

const distance = prompt("Enter distance travelled (KM)")
if(!distance) return

const km = Number(distance)

let extraDistance = 0

if(km > b.freeKm){
extraDistance = km - b.freeKm
}

const extraCharge = extraDistance * b.extraPrice
const total = Number(b.price_per_day) + extraCharge

await updateDoc(
doc(db,"vehicle_bookings",b.id),
{
distance_travelled:km,
extra_distance:extraDistance,
total_price:total
}
)

alert("Distance saved")
loadBookings()

}

/* CONFIRM PAYMENT */

const confirmPayment = async(b:any)=>{

const method = prompt("Payment method (cash / gpay)")
if(!method) return

let txn=""

if(method==="gpay"){
txn = prompt("Enter transaction ID") || ""
}

await updateDoc(
doc(db,"vehicle_bookings",b.id),
{
payment_method:method,
transaction_id:txn,
payment_status:"paid"
}
)

/* SEND EMAIL RECEIPT */

try{

await fetch("http://localhost:5000/send-receipt",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

customerEmail:b.customer_email,
vehicleName:b.vehicleName,
vehicleNumber:b.vehicle_number,
distance:b.distance_travelled,
freeKm:b.freeKm,
extraDistance:b.extra_distance,
extraCharge:(b.extra_distance || 0) * (b.extraPrice || 0),
pricePerDay:b.price_per_day,
totalPrice:b.total_price,
paymentMethod:method,
transactionId:txn

})

})

}catch(err){
console.log("Email failed")
}

alert("Payment confirmed and receipt sent")

loadBookings()

}

/* NOTIFY CUSTOMER */

const notifyCustomer = async(id:string)=>{

await updateDoc(
doc(db,"vehicle_bookings",id),
{
notify_payment:true
}
)

alert("Customer notified")
loadBookings()

}

/* COMPLETE BOOKING */

const completeBooking = async(id:string,vehicleId:string,date:string)=>{

const today = new Date().toISOString().split("T")[0]

if(today < date){

alert("Cannot complete booking before ride date")
return

}

await updateDoc(
doc(db,"vehicle_bookings",id),
{
status:"completed"
}
)

await updateDoc(
doc(db,"vehicles",vehicleId),
{
is_available:true
}
)

alert("Booking completed")
loadBookings()

}

/* SPLIT BOOKINGS */

const activeBookings = bookings.filter(b => b.status !== "completed")
const completedBookings = bookings.filter(b => b.status === "completed")

return(

<div className="vehicle-bookings">

<h2 className="page-title">Vehicle Bookings</h2>

{/* SUMMARY */}

<div className="owner-summary">

<div className="summary-card">
<h3>Total Earnings</h3>
<p>₹{totalEarnings}</p>
</div>

</div>

{/* ACTIVE BOOKINGS */}

<h3 className="section-title">ACTIVE BOOKINGS</h3>

{activeBookings.length===0 &&(

<p>No active bookings</p>
)}

{activeBookings.map(b=>(

<div key={b.id} className="booking-card">

<div className="booking-header">

<h3>{b.vehicleName}</h3>

<span style={{color:"#ffc107"}}>Active Booking</span>

</div>

<div className="booking-info">

<p><b>CUSTOMER:</b> {b.customerName}</p>

<p>
<b>BOOKING DATES:</b>{" "}
{b.start_date ? `${b.start_date} → ${b.end_date}` : b.date}
</p>

<p>
<b>PAYMENT STATUS:</b>{" "}
{b.payment_status==="paid"
? <span style={{color:"lime"}}>Paid</span>
: <span style={{color:"orange"}}>Pending</span>}
</p>

</div>

{b.distance_travelled && (

<p><b>DISTANCE TRAVELLED:</b> {b.distance_travelled} KM</p>
)}

{b.total_price && (

<p><b>TOTAL PRICE:</b> ₹{b.total_price}</p>
)}

<div className="booking-actions">

{!b.distance_travelled && (

<button
className="btn btn-success"
onClick={()=>enterDistance(b)}

>

Enter Distance </button>

)}

{b.distance_travelled && b.payment_status!=="paid" &&(

<>

<button
className="btn btn-success"
onClick={()=>confirmPayment(b)}

>

Confirm Payment </button>

<button
className="btn btn-warning"
onClick={()=>notifyCustomer(b.id)}

>

Notify Customer </button>

</>

)}

{b.payment_status==="paid" && b.status!=="completed" &&(

<button
className="btn btn-danger"
onClick={()=>completeBooking(b.id,b.vehicle_id,b.start_date || b.date)}

>

Complete Booking </button>

)}

</div>

</div>

))}

{/* COMPLETED BOOKINGS */}

<h3 className="section-title">COMPLETED BOOKINGS</h3>

{completedBookings.length===0 &&(

<p>No completed bookings</p>
)}

{completedBookings.map(b=>(

<div key={b.id} className="booking-card">

<div className="booking-header">

<h3>{b.vehicleName}</h3>

<span style={{color:"#00ff9d"}}>Completed</span>

</div>

<div className="booking-info">

<p><b>CUSTOMER:</b> {b.customerName}</p>

<p>
<b>BOOKING DATES:</b>{" "}
{b.start_date ? `${b.start_date} → ${b.end_date}` : b.date}
</p>

<p><b>PAYMENT STATUS:</b> Paid</p>

</div>

{b.distance_travelled && (

<p><b>DISTANCE TRAVELLED:</b> {b.distance_travelled} KM</p>
)}

{b.total_price && (

<p><b>TOTAL PRICE:</b> ₹{b.total_price}</p>
)}

</div>

))}

</div>

)

}
