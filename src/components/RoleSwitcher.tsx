import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { doc,updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../context/AuthContext"

export default function RoleSwitcher(){

const { user,userData } = useAuth()
const navigate = useNavigate()

const [role,setRole] = useState(userData?.active_role)

useEffect(()=>{
setRole(userData?.active_role)
},[userData])

const changeRole = async(newRole:string)=>{

if(!user) return

await updateDoc(
doc(db,"users",user.uid),
{
active_role:newRole
}
)

localStorage.setItem("active_role",newRole)

setRole(newRole)

/* force navigation */
setTimeout(()=>{

if(newRole==="customer"){
navigate("/customer")
}

if(newRole==="driver"){
navigate("/driver")
}

if(newRole==="owner"){
navigate("/owner")
}

},200)

}

return(

<select
value={role}
onChange={(e)=>changeRole(e.target.value)}
className="role-switch"
>

<option value="customer">Customer</option>

{userData?.is_driver && (
<option value="driver">Driver</option>
)}

{userData?.is_owner && (
<option value="owner">Owner</option>
)}

</select>

)

}