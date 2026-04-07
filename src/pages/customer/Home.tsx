import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import "../../styles/home.css"

export default function Home(){

/* COUNTERS */

const [vehicles,setVehicles]=useState(0)
const [drivers,setDrivers]=useState(0)
const [users,setUsers]=useState(0)

useEffect(()=>{

let v=0
let d=0
let u=0

const interval=setInterval(()=>{

if(v<120){
v++
setVehicles(v)
}

if(d<45){
d++
setDrivers(d)
}

if(u<350){
u+=5
setUsers(u)
}

},30)

return ()=>clearInterval(interval)

},[])


const fadeUp={
initial:{opacity:0,y:40},
whileInView:{opacity:1,y:0},
viewport:{once:true},
transition:{duration:.6}
}


return(

<div className="home-page">

{/* HERO */}

<section className="hero">

<div className="hero-overlay"/>

<div className="hero-content">

<motion.h1 {...fadeUp}>
Welcome to NexDrive
</motion.h1>

<motion.p {...fadeUp}>
A modern vehicle rental platform connecting
Customers, Drivers and Vehicle Owners.
</motion.p>

</div>

</section>

{/* HOW SYSTEM WORKS */}

<section className="section">

<h2>How NexDrive Works</h2>

<div className="info-grid">

<motion.div className="info-card" {...fadeUp}>
<h3>Customer</h3>
<p>
Customers browse vehicles, hire drivers,
book rides and receive automated invoices.
</p>
</motion.div>

<motion.div className="info-card" {...fadeUp}>
<h3>Driver</h3>
<p>
Drivers add availability dates, accept hire
requests and complete trips while confirming
payments through the system.
</p>
</motion.div>

<motion.div className="info-card" {...fadeUp}>
<h3>Vehicle Owner</h3>
<p>
Owners list commercial vehicles for rent, manage bookings
and generate payment invoices.
</p>
</motion.div>

</div>

</section>


{/* CUSTOMER WORKFLOW */}

<section className="section dark">

<h2>Customer Workflow</h2>

<div className="workflow">

<div className="step">Register / Login</div>
<div className="step">Browse Vehicles</div>
<div className="step">Hire Driver</div>
<div className="step">Book Vehicle</div>
<div className="step">Make Payment</div>
<div className="step">Receive Invoice</div>

</div>

</section>


{/* DRIVER WORKFLOW */}

<section className="section">

<h2>Driver Workflow</h2>

<div className="workflow">

<div className="step">Request Driver Role</div>
<div className="step">Admin Approval</div>
<div className="step">Add Available Dates</div>
<div className="step">Accept Hire Request</div>
<div className="step">Complete Trip</div>
<div className="step">Confirm Payment</div>

</div>

</section>


{/* OWNER WORKFLOW */}

<section className="section dark">

<h2>Owner Workflow</h2>

<div className="workflow">

<div className="step">Request Owner Role</div>
<div className="step">Admin Approval</div>
<div className="step">Add Vehicle</div>
<div className="step">Receive Bookings</div>
<div className="step">Confirm Payment</div>
<div className="step">Generate Invoice</div>

</div>

</section>


{/* AI FEATURE */}

<section className="section ai">

<h2>AI Vehicle Finder</h2>

<p>

NexDrive intelligently identifies the nearest
available commercialvehicles by analysing driver
availability, vehicle location and booking
demand patterns. This reduces waiting time
and improves booking efficiency.

</p>

</section>


<footer className="footer">

<p>© 2026 NexDrive Commercial Vehicle Rental Platform</p>

</footer>


</div>

)

}
