import { useEffect, useState } from "react"
import { collection,getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function Reports(){

const [reports,setReports] = useState<any[]>([])

useEffect(()=>{
loadReports()
},[])

const loadReports = async()=>{

const snap = await getDocs(collection(db,"reports"))

const data:any[]=[]

snap.forEach(d=>{
data.push({id:d.id,...d.data()})
})

setReports(data)

}

return(

<div>

<h2>Reports</h2>

{reports.map(r=>{

return(

<div key={r.id} className="report-card">

<p><b>Booking:</b> {r.booking_id}</p>

<p><b>Reason:</b> {r.reason}</p>

<p><b>Status:</b> {r.status}</p>

</div>

)

})}

</div>

)
}