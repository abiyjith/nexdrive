import { useEffect,useState } from "react"
import { collection,getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"
import "../../styles/home.css"

export default function Home(){

const [vehicles,setVehicles]=useState<any[]>([])

useEffect(()=>{
loadVehicles()
},[])

const loadVehicles=async()=>{

const snap=await getDocs(collection(db,"vehicles"))

const list=snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setVehicles(list)

}

return(

<div className="home-page">

<h2>Available Vehicles</h2>

<div className="vehicle-list">

{vehicles.map(v=>(

<div className="vehicle-card" key={v.id}>

<h3>{v.name}</h3>
<p>{v.price_per_day} per day</p>

</div>

))}

</div>

</div>

)

}