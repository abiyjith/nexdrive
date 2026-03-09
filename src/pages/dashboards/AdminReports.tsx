import { useEffect,useState } from "react"
import { collection,getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function AdminReports(){

const [reports,setReports] = useState<any[]>([])

useEffect(()=>{

const load = async()=>{

const snap = await getDocs(collection(db,"reports"))

setReports(
snap.docs.map(d=>({id:d.id,...d.data()}))
)

}

load()

},[])

return(

<div>

<h2>User Reports</h2>

{reports.map(r=>(

<div key={r.id}>

<p>Reported By: {r.reporter}</p>
<p>Message: {r.message}</p>

</div>

))}

</div>

)

}