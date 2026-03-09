import { useEffect, useState } from "react"
import {
collection,
getDocs,
doc,
updateDoc,
getDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useNavigate } from "react-router-dom"

import "../../styles/admin.css"

export default function AdminRequests(){

const navigate = useNavigate()

const [requests,setRequests]=useState<any[]>([])

useEffect(()=>{
loadRequests()
},[])

const loadRequests = async () => {

try{

const snap = await getDocs(collection(db,"role_requests"))

const list:any[] = []

for(const r of snap.docs){

const data = r.data()

let userEmail = "Unknown"

if(data.user_id){

const userSnap = await getDoc(
doc(db,"users",data.user_id)
)

if(userSnap.exists()){
userEmail = userSnap.data().email
}

}

list.push({
id:r.id,
...data,
userEmail
})

}

setRequests(list)

}catch(err){

console.error("Error loading requests:",err)

}

}

const approve = async(req:any)=>{

try{

await updateDoc(
doc(db,"users",req.user_id),
{
[`is_${req.role_requested}`]:true
}
)

await updateDoc(
doc(db,"role_requests",req.id),
{
status:"approved"
}
)

alert("Role approved")

loadRequests()

}catch(err){

console.error(err)

}

}

const reject = async(req:any)=>{

const reason = prompt("Enter rejection reason")

if(!reason) return

try{

await updateDoc(
doc(db,"role_requests",req.id),
{
status:"rejected",
admin_message:reason
}
)

alert("Request rejected")

loadRequests()

}catch(err){

console.error(err)

}

}

return(

<div className="admin-page">

<button
className="back-btn"
onClick={()=>navigate("/admin")}
>
← Back to Dashboard
</button>

<h2>Role Requests</h2>

<table className="admin-table">

<thead>

<tr>
<th>Email</th>
<th>Role</th>
<th>License</th>
<th>Status</th>
<th>Action</th>
</tr>

</thead>

<tbody>

{requests.length===0 && (

<tr>
<td colSpan={5} style={{textAlign:"center"}}>
No Requests Found
</td>
</tr>

)}

{requests.map(req=>(

<tr key={req.id}>

<td>{req.userEmail}</td>

<td>{req.role_requested}</td>

<td>

<a
href={req.license_url}
target="_blank"
>

View License

</a>

</td>

<td>{req.status}</td>

<td>

{req.status==="pending" && (

<>

<button
className="approve-btn"
onClick={()=>approve(req)}
>

Approve

</button>

<button
className="reject-btn"
onClick={()=>reject(req)}
>

Reject

</button>

</>

)}

</td>

</tr>

))}

</tbody>

</table>

</div>

)

}