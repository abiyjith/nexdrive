import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { useState } from "react"

const containerStyle = {
width: "100%",
height: "300px",
borderRadius: "10px"
}

export default function MapPicker({setLocation}:any){

const {isLoaded}=useLoadScript({
googleMapsApiKey:import.meta.env.VITE_GOOGLE_MAPS_KEY
})

const [marker,setMarker]=useState<any>(null)

if(!isLoaded) return <p>Loading Map...</p>

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

})

}

return(

<div>

<GoogleMap
mapContainerStyle={containerStyle}
zoom={13}
center={marker || {lat:8.5241,lng:76.9366}}
onClick={mapClick}
>

{marker && <Marker position={marker}/>}

</GoogleMap>

<button
style={{marginTop:"10px"}}
onClick={useCurrentLocation}
className="btn btn-success"
>

Use My Current Location

</button>

</div>

)

}