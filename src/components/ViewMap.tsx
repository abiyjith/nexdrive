import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "250px"
}

export default function ViewMap({
  lat,
  lng
}:{
  lat:number
  lng:number
}){

const { isLoaded } = useLoadScript({
googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
})

if(!isLoaded) return <p>Loading map...</p>

return(

<GoogleMap
mapContainerStyle={containerStyle}
zoom={14}
center={{lat,lng}}
>

<Marker position={{lat,lng}}/>

</GoogleMap>

)

}