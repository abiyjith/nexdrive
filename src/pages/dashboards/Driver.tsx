
import '../../index.css'
export default function Driver(){
  return (
    <div style={{padding:24}}>
      <h2>Driver Dashboard</h2>
      <div className="grid">
        <div className="card">Current Trips</div>
        <div className="card">Earnings</div>
        <div className="card">Availability</div>
      </div>
    </div>
  )
}
