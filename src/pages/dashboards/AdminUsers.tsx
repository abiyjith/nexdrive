import { useEffect,useState } from "react"
import {
collection,
getDocs,
doc,
updateDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useNavigate } from "react-router-dom"

import "../../styles/admin.css"

export default function AdminUsers(){

const navigate = useNavigate()

const [users,setUsers] = useState<any[]>([])

useEffect(()=>{

const load = async()=>{

const snap = await getDocs(collection(db,"users"))

setUsers(
snap.docs.map(d=>({id:d.id,...d.data()}))
)

}

load()

},[])

const banUser = async(id:string)=>{

await updateDoc(doc(db,"users",id),{
banned:true
})

alert("User banned")

}

const unbanUser = async(id:string)=>{

await updateDoc(doc(db,"users",id),{
banned:false
})

alert("User unbanned")

}

return(

<div className="admin-page">

<button
className="back-btn"
onClick={()=>navigate("/admin")}
>
← Back to Dashboard
</button>

<h2>All Users</h2>

<div className="admin-grid">

{users.map(u=>(

<div key={u.id} className="admin-card">

<p><b>Email:</b> {u.email}</p>

<p>
<b>Status:</b>{" "}
{u.banned ? (
<span style={{color:"red"}}>Banned</span>
):(
<span style={{color:"green"}}>Active</span>
)}
</p>

<button
className="danger-btn"
onClick={()=>banUser(u.id)}
>
Ban User
</button>

<button
className="approve-btn"
onClick={()=>unbanUser(u.id)}
>
Unban
</button>

</div>

))}

</div>

</div>

)

}