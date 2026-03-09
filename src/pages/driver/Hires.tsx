import { useEffect,useState } from "react"
import {
collection,
query,
where,
getDocs,
doc,
updateDoc,
getDoc,
addDoc,
deleteDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"

import "../../styles/ui.css"

export default function Hires(){

const {user}=useAuth()

const [hires,setHires]=useState<any[]>([])

useEffect(()=>{
loadHires()
},[])

const loadHires=async()=>{

const q=query(
collection(db,"driver_bookings"),
where("driver_id","==",user?.uid)
)

const snap=await getDocs(q)

const list:any=[]

for(const d of snap.docs){

const data=d.data()

const customerSnap=await getDoc(doc(db,"users",data.customer_id))

list.push({
id:d.id,
...data,
customerName:customerSnap.data()?.first_name
})

}

setHires(list)

}

const isTripDatePassed=(tripDate:string)=>{

const today=new Date()
const rideDate=new Date(tripDate)

today.setHours(0,0,0,0)
rideDate.setHours(0,0,0,0)

return today>=rideDate

}

/* ACCEPT HIRE */

const acceptHire=async(id:string)=>{

await updateDoc(doc(db,"driver_bookings",id),{
status:"accepted"
})

loadHires()

}

/* COMPLETE TRIP */

const completeTrip=async(id:string)=>{

await updateDoc(doc(db,"driver_bookings",id),{
status:"completed"
})

loadHires()

}

/* CONFIRM PAYMENT */

const confirmPayment=async(h:any)=>{

const method = prompt("Payment method (cash / gpay)")

if(!method) return

let txn=""

if(method==="gpay"){
txn = prompt("Enter transaction ID") || ""
}

await updateDoc(doc(db,"driver_bookings",h.id),{

payment_method:method,
transaction_id:txn,
payment_status:"paid",
notify_payment:false

})

try{

await fetch("http://localhost:5000/send-driver-invoice",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

customerEmail:h.customer_email,
driverName:user?.email,
date:h.date,
pickupLocation:h.pickup_location,
price:h.driver_price,
paymentMethod:method,
transactionId:txn

})

})

}catch(err){

console.log("Invoice send failed")

}

alert("Payment confirmed & invoice sent")

loadHires()

}

/* NOTIFY CUSTOMER */

const notifyCustomer=async(id:string)=>{

await updateDoc(doc(db,"driver_bookings",id),{
notify_payment:true
})

}

/* REPORT CUSTOMER */

const reportCustomer=async(customerId:string,bookingId:string)=>{

const reason=prompt("Enter report reason")

if(!reason) return

await addDoc(collection(db,"reports"),{

customer_id:customerId,
driver_id:user?.uid,
booking_id:bookingId,
reason,
created_at:new Date(),
status:"pending"

})

}

/* DELETE BOOKING */

const deleteHire=async(id:string)=>{

const confirmDelete=window.confirm("Delete this booking?")

if(!confirmDelete) return

await deleteDoc(doc(db,"driver_bookings",id))

loadHires()

}

return(

<div className="page-container">

<h2 className="page-title">Driver Hires</h2>

<div className="cards-grid">

{hires.map(h=>(

<div className="card" key={h.id}>

<div className="name">
Customer: {h.customerName}
</div>

<p><b>Date:</b> {h.date}</p>

<p><b>Status:</b> {h.status}</p>

<p><b>Driver Price:</b> ₹{h.driver_price}</p>

<p><b>Payment Method:</b> {h.payment_method}</p>

<p><b>Payment Status:</b> {h.payment_status}</p>

<p><b>Pickup Location:</b></p>

<button
className="btn btn-success"
onClick={()=>window.open(`https://www.google.com/maps?q=${h.pickup_location}`)}

>

Open Pickup Location </button>

<div className="actions">

{h.status==="pending" && (
<button
className="btn btn-success"
onClick={()=>acceptHire(h.id)}

>

Accept Hire </button>
)}

{h.status==="accepted" && isTripDatePassed(h.date) && (
<button
className="btn btn-warning"
onClick={()=>completeTrip(h.id)}

>

Complete Trip </button>
)}

{h.payment_status!=="paid" && (
<button
className="btn btn-success"
onClick={()=>confirmPayment(h)}

>

Confirm Payment </button>
)}

<button
className="btn btn-warning"
onClick={()=>notifyCustomer(h.id)}

>

Notify Customer To Pay </button>

<button
className="btn btn-danger"
onClick={()=>reportCustomer(h.customer_id,h.id)}

>

Report Customer </button>

{h.status==="completed" && (
<button
className="btn btn-danger"
onClick={()=>deleteHire(h.id)}

>

Delete Booking </button>
)}

</div>

</div>

))}

</div>

</div>

)

}
