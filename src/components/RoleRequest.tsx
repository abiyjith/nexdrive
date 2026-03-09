import { useState, useEffect } from "react"
import { db, storage } from "../lib/firebase"
import {
collection,
addDoc,
query,
where,
getDocs,
serverTimestamp
} from "firebase/firestore"

import {
ref,
uploadBytes,
getDownloadURL
} from "firebase/storage"

import { useAuth } from "../context/AuthContext"

export default function RoleRequest({ role }: { role: "driver" | "owner" }) {

const { user } = useAuth()

const [file,setFile]=useState<File | null>(null)
const [status,setStatus]=useState("")
const [message,setMessage]=useState("")

useEffect(()=>{
loadRequest()
},[])

const loadRequest=async()=>{

if(!user) return

const q=query(
collection(db,"role_requests"),
where("user_id","==",user.uid),
where("role_requested","==",role)
)

const snap=await getDocs(q)

if(!snap.empty){

const data=snap.docs[0].data()

setStatus(data.status)
setMessage(data.admin_message || "")

}

}

const sendRequest=async()=>{

if(!file){
alert("Upload driving license")
return
}

if(!user) return

const storageRef=ref(storage,`licenses/${user.uid}_${Date.now()}`)

await uploadBytes(storageRef,file)

const url=await getDownloadURL(storageRef)

await addDoc(collection(db,"role_requests"),{

user_id:user.uid,
role_requested:role,
license_url:url,
status:"pending",
admin_message:"",
created_at:serverTimestamp()

})

alert("Request sent")

setStatus("pending")

}

if(status==="pending"){
return <p style={{color:"orange"}}>Request Pending</p>
}

if(status==="approved"){
return <p style={{color:"green"}}>Approved by admin</p>
}

return(

<div>

{status==="rejected" && (

<div style={{color:"red"}}>
Rejected: {message}
</div>

)}

<input
type="file"
onChange={(e)=>setFile(e.target.files?.[0] || null)}
/>

<button
className="primary-btn"
onClick={sendRequest}
>

Request {role}

</button>

</div>

)

}