import { useEffect, useState } from "react"
import {
collection,
addDoc,
query,
where,
getDocs,
deleteDoc,
doc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"
import { switchRole } from "../../lib/roleHelpers"

import "../../styles/customer.css"

export default function DriverDashboard(){

const { user, userData } = useAuth()

const [date,setDate] = useState("")
const [dates,setDates] = useState<any[]>([])

useEffect(()=>{
loadDates()
},[])

/* LOAD DRIVER AVAILABILITY */

const loadDates = async()=>{

if(!user) return

const q = query(
collection(db,"driver_availability"),
where("driver_id","==",user.uid)
)

const snap = await getDocs(q)

const data = snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setDates(data)

}

/* ADD DATE */

const addDate = async()=>{

if(!date){
alert("Select date")
return
}

await addDoc(collection(db,"driver_availability"),{

driver_id:user?.uid,
date

})

setDate("")
loadDates()

}

/* DELETE DATE */

const deleteDate = async(id:string)=>{

await deleteDoc(doc(db,"driver_availability",id))
loadDates()

}

/* REQUEST OWNER ROLE */

const requestOwnerRole = async()=>{

await addDoc(collection(db,"role_requests"),{

user_id:user?.uid,
requested_role:"owner",
status:"pending"

})

alert("Owner role request sent")

}

return(

<div className="page">

<h2 className="title">Driver Dashboard</h2>

{/* SWITCH ROLE */}

<div className="card">

<h3>Switch Role</h3>

<div style={{display:"flex",gap:"10px"}}>

<button
className="primary-btn"
onClick={()=>switchRole(user!.uid,"customer")}

>

Customer Mode </button>

{userData?.is_owner &&(

<button
className="primary-btn"
onClick={()=>switchRole(user!.uid,"owner")}

>

Owner Mode </button>

)}

</div>

</div>

{/* REQUEST OWNER */}

{!userData?.is_owner &&(

<div className="card">

<h3>Request Owner Role</h3>

<button
className="primary-btn"
onClick={requestOwnerRole}

>

Request Owner Role

</button>

</div>

)}

{/* DRIVER AVAILABILITY */}

<div className="card">

<h3>Add Available Date</h3>

<input
type="date"
value={date}
onChange={(e)=>setDate(e.target.value)}
/>

<button
className="primary-btn"
onClick={addDate}

>

Add Date

</button>

</div>

<div className="grid">

{dates.map(d=>(

<div key={d.id} className="card">

<p>{d.date}</p>

<button
className="secondary-btn"
onClick={()=>deleteDate(d.id)}

>

Remove

</button>

</div>

))}

</div>

</div>

)

}
