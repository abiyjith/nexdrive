import { useState } from "react"
import {
collection,
addDoc,
query,
where,
getDocs
} from "firebase/firestore"

import {
ref,
uploadBytes,
getDownloadURL
} from "firebase/storage"

import { db, storage } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"
import "../../styles/customer.css"

export default function DriverRequests(){

const { user } = useAuth()

const [role,setRole] = useState("driver")
const [license,setLicense] = useState<File | null>(null)
const [loading,setLoading] = useState(false)

const submitRequest = async () => {

if(!license){

alert("Upload Driving License")

return

}

setLoading(true)

try{

const fileRef = ref(
storage,
`licenses/${user?.uid}_${Date.now()}`
)

await uploadBytes(fileRef,license)

const url = await getDownloadURL(fileRef)

const q = query(
collection(db,"role_requests"),
where("user_id","==",user?.uid),
where("role","==",role)
)

const existing = await getDocs(q)

if(!existing.empty){

alert("Request already submitted")

setLoading(false)

return

}

await addDoc(collection(db,"role_requests"),{

user_id:user?.uid,
role,
license_url:url,
status:"pending",
admin_message:"",
created_at:new Date()

})

alert("Request submitted")

}catch(err){

console.error(err)

}

setLoading(false)

}

return(

<div className="page-container">

<h2 className="page-title">

Role Request

</h2>

<div className="form-card">

<label>Role</label>

<select
value={role}
onChange={(e)=>setRole(e.target.value)}
>

<option value="driver">Driver</option>
<option value="owner">Owner</option>

</select>

<label>Upload Driving License</label>

<input
type="file"
onChange={(e)=>setLicense(e.target.files?.[0] || null)}
/>

<button
className="primary-btn"
onClick={submitRequest}
disabled={loading}
>

{loading ? "Submitting..." : "Submit Request"}

</button>

</div>

</div>

)

}