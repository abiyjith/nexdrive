import { useEffect, useState } from "react"
import {
collection,
query,
where,
getDocs,
updateDoc,
doc,
getDoc
} from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { db } from "../../lib/firebase"
import { FaCarSide, FaArrowLeft, FaCheck, FaTimes, FaFileAlt } from "react-icons/fa"

import "../../styles/admin.css"

export default function AdminVehicles(){
const navigate = useNavigate()
const [pending,setPending]=useState<any[]>([])
const [approved,setApproved]=useState<any[]>([])
const [loading,setLoading]=useState(true)

useEffect(()=>{
loadVehicles()
},[])

/* LOAD VEHICLES */

const loadVehicles=async()=>{

/* PENDING */

const pendingQuery=query(
collection(db,"vehicles"),
where("status","==","pending")
)

const pendingSnap=await getDocs(pendingQuery)

const pendingList:any=[]

for(const d of pendingSnap.docs){

const data=d.data()

let ownerName="Owner"

if(data.owner_id){

const ownerSnap=await getDoc(doc(db,"users",data.owner_id))

if(ownerSnap.exists()){
ownerName=ownerSnap.data().first_name
}

}

pendingList.push({
id:d.id,
...data,
ownerName
})

}

/* APPROVED */

const approvedQuery=query(
collection(db,"vehicles"),
where("status","==","approved")
)

const approvedSnap=await getDocs(approvedQuery)

const approvedList=approvedSnap.docs.map(d=>({
id:d.id,
...d.data()
}))

setPending(pendingList)
setApproved(approvedList)

setLoading(false)

}

/* APPROVE VEHICLE */

const approveVehicle=async(id:string)=>{

await updateDoc(
doc(db,"vehicles",id),
{
status:"approved",
is_available:true
}
)

alert("Vehicle approved")

loadVehicles()

}

/* REJECT VEHICLE */

const rejectVehicle=async(id:string)=>{

const reason=prompt("Enter rejection reason")

if(!reason) return

await updateDoc(
doc(db,"vehicles",id),
{
status:"rejected",
admin_message:reason
}
)

alert("Vehicle rejected")

loadVehicles()

}

if(loading){
return <p>Loading vehicles...</p>
}

return(
    <div className="admin-page">

      <div className="admin-header-glass">
        <div className="admin-header-info">
          <FaCarSide className="admin-header-icon" />
          <div>
            <h2 className="admin-title">Vehicle Approvals</h2>
            <p className="admin-subtitle">Process new vehicle registrations</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft style={{ marginRight: '8px' }}/> Back to Dashboard
        </button>
      </div>

      <div className="admin-content-wrapper">
        
        {/* PENDING REQUESTS */}
        <section className="admin-section">
          <div className="section-header alert-header">
            <h3>Pending Requests</h3>
            <p>Vehicles awaiting your approval</p>
          </div>

          <div className="admin-grid">
            {pending.length===0 &&(
              <p style={{color:'#888'}}>No pending vehicle requests</p>
            )}

            {pending.map(v=>(
              <div key={v.id} className="admin-card">
                <img
                  src={v.vehicle_image}
                  style={{
                    width:"100%", height:"160px", objectFit:"cover",
                    borderRadius:"8px", marginBottom:"15px"
                  }}
                />

                <h3 style={{margin:0, color:'white'}}>{v.brand} {v.model}</h3>
                
                <div style={{color:'#aaa', fontSize:'14px', lineHeight:'1.6', marginTop:'10px'}}>
                  <p><b>Owner:</b> <span style={{color:'#fff'}}>{v.ownerName}</span></p>
                  <p><b>Fuel:</b> {v.fuel}</p>
                  <p><b>Year:</b> {v.year}</p>
                  <p><b>Price:</b> <span style={{color:'#22c55e'}}>₹{v.price_per_day}</span></p>
                </div>

                <a
                  href={v.vehicle_rc}
                  target="_blank"
                  rel="noreferrer"
                  style={{display:'inline-flex', alignItems:'center', background:'#333', color:'white', padding:'8px 12px', borderRadius:'6px', textDecoration:'none', marginTop:'10px', fontSize:'14px'}}
                >
                  <FaFileAlt style={{marginRight:'8px'}}/> View RC Document
                </a>

                <div style={{marginTop:"20px", display:'flex', gap:'10px'}}>
                  <button
                    className="logout-btn"
                    style={{flex:1, background:'rgba(34,197,94,0.1)', color:'#22c55e', borderColor:'transparent'}}
                    onClick={()=>approveVehicle(v.id)}
                  >
                    <FaCheck style={{marginRight:'5px'}}/> Approve
                  </button>
                  <button
                    className="logout-btn"
                    style={{flex:1, background:'rgba(255,77,77,0.1)', color:'#ff4d4d', borderColor:'transparent'}}
                    onClick={()=>rejectVehicle(v.id)}
                  >
                    <FaTimes style={{marginRight:'5px'}}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* APPROVED VEHICLES */}
        <section className="admin-section">
          <div className="section-header">
            <h3>Recently Approved</h3>
            <p>Vehicles successfully registered on the platform</p>
          </div>

          <div className="admin-grid">
            {approved.length===0 &&(
              <p style={{color:'#888'}}>No approved vehicles yet</p>
            )}

            {approved.map(v=>(
              <div key={v.id} className="admin-card" style={{opacity: 0.8}}>
                <img
                  src={v.vehicle_image}
                  style={{
                    width:"100%", height:"160px", objectFit:"cover", borderRadius:"8px", marginBottom:"15px"
                  }}
                />

                <h3 style={{margin:0, color:'white'}}>{v.brand} {v.model}</h3>

                <div style={{color:'#aaa', fontSize:'14px', lineHeight:'1.6', marginTop:'10px'}}>
                  <p><b>Fuel & Year:</b> {v.fuel} • {v.year}</p>
                  <p><b>Price:</b> ₹{v.price_per_day}</p>
                </div>

                <p style={{background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'6px 10px', borderRadius:'6px', display:'inline-block', marginTop:'15px', fontSize:'13px', fontWeight:'bold'}}>
                  <FaCheck style={{marginRight:'5px'}}/> Approved
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )

}
