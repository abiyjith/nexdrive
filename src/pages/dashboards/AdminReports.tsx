import { useEffect,useState } from "react"
import {
collection,
getDocs,
doc,
getDoc,
updateDoc,
deleteDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useNavigate } from "react-router-dom"
import { FaExclamationTriangle, FaArrowLeft, FaReply, FaTrash } from "react-icons/fa"

import "../../styles/admin.css"

export default function AdminReports(){

const navigate = useNavigate()

const [reports,setReports] = useState<any[]>([])
const [reply,setReply] = useState("")

useEffect(()=>{
loadReports()
},[])

/* ===============================
LOAD REPORTS
=============================== */

const loadReports = async()=>{

const snap = await getDocs(collection(db,"reports"))

const list:any[]=[]

for(const d of snap.docs){

const data=d.data()

let driverEmail="Unknown"
let customerEmail="Unknown"

/* GET DRIVER EMAIL */

if(data.driver_id){

const driverSnap = await getDoc(
doc(db,"users",data.driver_id)
)

if(driverSnap.exists()){
driverEmail = driverSnap.data().email
}

}

/* GET CUSTOMER EMAIL */

if(data.customer_id){

const customerSnap = await getDoc(
doc(db,"users",data.customer_id)
)

if(customerSnap.exists()){
customerEmail = customerSnap.data().email
}

}

list.push({
id:d.id,
...data,
driverEmail,
customerEmail
})

}

setReports(list)

}

/* ===============================
ADMIN REPLY
=============================== */

const sendReply = async(id:string)=>{

if(!reply){
alert("Enter reply")
return
}

await updateDoc(
doc(db,"reports",id),
{
admin_reply:reply,
status:"resolved"
}
)

alert("Reply sent")

setReply("")

loadReports()

}

/* ===============================
DELETE REPORT
=============================== */

const deleteReport = async(id:string)=>{

const confirmDelete = window.confirm(
"Delete this report?"
)

if(!confirmDelete) return

await deleteDoc(doc(db,"reports",id))

alert("Report deleted")

loadReports()

}

/* ===============================
UI
=============================== */

return(
    <div className="admin-page">

      <div className="admin-header-glass">
        <div className="admin-header-info">
          <FaExclamationTriangle className="admin-header-icon" />
          <div>
            <h2 className="admin-title">Reports</h2>
            <p className="admin-subtitle">Manage user complaints and platform issues</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft style={{ marginRight: '8px' }}/> Back to Dashboard
        </button>
      </div>

      <div className="admin-content-wrapper">
        <section className="admin-section">
          <div className="section-header alert-header">
            <h3>User Reports</h3>
            <p>Review and resolve submitted issues</p>
          </div>

          <div className="admin-grid">
            {reports.length===0 &&(
              <p style={{color:'#888'}}>No reports available</p>
            )}

            {reports.map(r=>(
              <div key={r.id} className="admin-card" style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                
                <div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                    <h3 style={{color: 'white', margin: 0, fontSize:'18px'}}>Booking #{r.booking_id?.slice(-6) || r.booking_id}</h3>
                    <span className={`alert-badge ${r.status==='resolved' ? '' : 'active'}`} style={{background: r.status==='resolved' ? 'rgba(34,197,94,0.1)' : '#ff4d4d', color: r.status==='resolved' ? '#22c55e' : 'white'}}>
                      {r.status}
                    </span>
                  </div>

                  <div style={{color:'#ccc', fontSize:'14px', lineHeight:'1.8'}}>
                    <p><b>Driver:</b> <span style={{color:'#fff'}}>{r.driverEmail}</span></p>
                    <p><b>Customer:</b> <span style={{color:'#fff'}}>{r.customerEmail}</span></p>
                    
                    <div style={{background:'rgba(255,255,255,0.05)', padding:'12px', borderRadius:'8px', marginTop:'15px', borderLeft:'3px solid #ff4d4d'}}>
                      <p style={{margin:0, color:'#ff4d4d', fontWeight:'bold', marginBottom:'5px'}}>Issue Reported:</p>
                      <p style={{margin:0, color:'#ddd'}}>{r.reason}</p>
                    </div>

                    {r.admin_reply &&(
                      <div style={{background:'rgba(34,197,94,0.1)', padding:'12px', borderRadius:'8px', marginTop:'10px', borderLeft:'3px solid #22c55e'}}>
                        <p style={{margin:0, color:'#22c55e', fontWeight:'bold', marginBottom:'5px'}}>Admin Reply:</p>
                        <p style={{margin:0, color:'#ddd'}}>{r.admin_reply}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{marginTop:'25px'}}>
                  {r.status!=="resolved" ? (
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                      <textarea
                        placeholder="Write admin reply..."
                        value={reply}
                        onChange={(e)=>setReply(e.target.value)}
                        style={{
                          width:"100%", padding:"12px", borderRadius:"8px",
                          background:"#1a1a1a", color:"white", border:"1px solid #333",
                          resize:'vertical', minHeight:'80px', fontFamily:'inherit'
                        }}
                      />
                      <div style={{display:'flex', gap:'10px'}}>
                        <button
                          className="logout-btn"
                          style={{flex: 1, background:'rgba(34,197,94,0.1)', color:'#22c55e', borderColor:'transparent'}}
                          onClick={()=>sendReply(r.id)}
                        >
                          <FaReply style={{marginRight:'5px'}}/> Send Reply
                        </button>
                        <button
                          className="logout-btn"
                          style={{flex: 1, background:'rgba(255, 77, 77, 0.1)', color:'#ff4d4d', borderColor:'transparent'}}
                          onClick={()=>deleteReport(r.id)}
                        >
                          <FaTrash style={{marginRight:'5px'}}/> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="logout-btn"
                      style={{width:'100%', background:'rgba(255, 77, 77, 0.1)', color:'#ff4d4d', borderColor:'transparent'}}
                      onClick={()=>deleteReport(r.id)}
                    >
                      <FaTrash style={{marginRight:'8px'}}/> Delete Report
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  )

}
