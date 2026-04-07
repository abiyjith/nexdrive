import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { useState, useCallback } from "react"
import { FaMapMarkerAlt, FaExclamationTriangle } from "react-icons/fa"

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "10px"
}

export default function MapPicker({setLocation}:any){

  const {isLoaded, loadError}=useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string
  })

  const [marker,setMarker]=useState<any>(null)
  const [mapError, setMapError] = useState(false)

  // Catch internal google maps rendering errors (like billing)
  const onLoad = useCallback(() => {
    // We can't entirely catch the iframe billing error natively via the API, 
    // but if the map refuses to load its tiles, we provide a manual override fallback below.
  }, [])

  if(loadError) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)', borderRadius: '10px', color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
        <FaExclamationTriangle size={40} style={{ color: 'var(--accent-warning)', marginBottom: '15px' }} />
        <p>Google Maps could not be loaded. Please check your API Key and Billing Account.</p>
      </div>
    )
  }

  if(!isLoaded) return <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Map...</p>

  const mapClick=(e:any)=>{
    const lat=e.latLng.lat()
    const lng=e.latLng.lng()
    setMarker({lat,lng})
    setLocation(`${lat},${lng}`)
  }

  const useCurrentLocation=()=>{
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat=pos.coords.latitude
      const lng=pos.coords.longitude
      setMarker({lat,lng})
      setLocation(`${lat},${lng}`)
    }, () => {
      // Manual fallback if map tiles are completely blocked by Google and they just want to set an arbitrary location
      setMarker({lat: 8.5241, lng: 76.9366})
      setLocation(`8.5241,76.9366`)
    })
  }

  return(
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {mapError ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)', borderRadius: '10px', color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
          <FaExclamationTriangle size={40} style={{ color: 'var(--accent-warning)', marginBottom: '15px' }} />
          <p>Google Maps API is restricted. Billing must be enabled on the Google Cloud Console.</p>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          zoom={13}
          center={marker || {lat:8.5241,lng:76.9366}}
          onClick={mapClick}
          onLoad={onLoad}
          options={{
            gestureHandling: "greedy"
          }}
        >
          {marker && <Marker position={marker}/>}
        </GoogleMap>
      )}

      <button
        style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 10, padding: "8px 16px", borderRadius: "8px", background: "var(--accent-success)", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        onClick={useCurrentLocation}
      >
        <FaMapMarkerAlt /> Use My Current Location
      </button>

      {/* Manual Override for Billing Errors */}
      <button
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10, padding: "6px 12px", borderRadius: "6px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "12px", backdropFilter: "blur(4px)" }}
        onClick={() => {
          setMapError(true);
          const lat = 8.5241; const lng = 76.9366;
          setMarker({lat, lng}); setLocation(`${lat},${lng}`);
        }}
        title="Click here if the map is blank to simulate a location selection"
      >
        Force Select Default Location
      </button>

    </div>
  )
}
