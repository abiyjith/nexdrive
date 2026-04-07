import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { FaExclamationTriangle } from "react-icons/fa"

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "10px"
}

export default function ViewMap({
  lat,
  lng
}: {
  lat: number
  lng: number
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string
  })

  if(loadError) {
    return (
      <div style={{ width: '100%', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)', borderRadius: '10px', color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
        <FaExclamationTriangle size={40} style={{ color: 'var(--accent-warning)', marginBottom: '15px' }} />
        <p>Map Error: Billing not enabled for this API Key.</p>
      </div>
    )
  }

  if(!isLoaded) return <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading map...</p>

  return (
    <div style={{ width: "100%", height: "250px", borderRadius: "10px", overflow: "hidden", position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={14}
        center={{lat,lng}}
        options={{ gestureHandling: "cooperative" }}
      >
        <Marker position={{lat,lng}}/>
      </GoogleMap>
    </div>
  )
}
