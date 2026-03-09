import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

import { db, storage } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"

import MapPicker from "../../components/MapPicker"

import "../../styles/owner.css"

export default function AddVehicle(){

const { user } = useAuth()

const [brand,setBrand] = useState("")
const [model,setModel] = useState("")
const [vehicleNumber,setVehicleNumber] = useState("")

const [fuel,setFuel] = useState("")
const [year,setYear] = useState("")

const [price,setPrice] = useState("")

const [freeKm,setFreeKm] = useState("")
const [extraPrice,setExtraPrice] = useState("")

const [location,setLocation] = useState<any>(null)

const [vehicleImage,setVehicleImage] = useState<File | null>(null)
const [rcFile,setRcFile] = useState<File | null>(null)

const [loading,setLoading] = useState(false)

const addVehicle = async()=>{

if(!brand || !model || !vehicleNumber || !price || !fuel || !year){
alert("Fill all fields")
return
}

if(!freeKm || !extraPrice){
alert("Enter free KM and extra price per KM")
return
}

if(!vehicleImage || !rcFile){
alert("Upload vehicle image and RC")
return
}

if(!location){
alert("Select vehicle location on map")
return
}

try{

setLoading(true)

/* UPLOAD IMAGE */

const imageRef = ref(
storage,
`vehicle_images/${user!.uid}_${Date.now()}`
)

await uploadBytes(imageRef,vehicleImage)
const vehicleImageURL = await getDownloadURL(imageRef)

/* UPLOAD RC */

const rcRef = ref(
storage,
`vehicle_rc/${user!.uid}_${Date.now()}`
)

await uploadBytes(rcRef,rcFile)
const rcURL = await getDownloadURL(rcRef)

/* SAVE VEHICLE */

await addDoc(collection(db,"vehicles"),{

owner_id:user!.uid,

brand,
model,
vehicle_number:vehicleNumber,

fuel,
year,

price_per_day:Number(price),

free_km_per_day:Number(freeKm),
extra_price_per_km:Number(extraPrice),

location,

vehicle_image:vehicleImageURL,
vehicle_rc:rcURL,

status:"pending",
admin_message:"",

is_available:false,

created_at:serverTimestamp()

})

alert("Vehicle request submitted for admin approval")

setBrand("")
setModel("")
setVehicleNumber("")
setFuel("")
setYear("")
setPrice("")
setFreeKm("")
setExtraPrice("")
setLocation(null)

}catch(err){

console.error(err)
alert("Error submitting vehicle")

}

setLoading(false)

}

return(

<div className="add-vehicle">

<h2>Add Vehicle</h2>

<input
placeholder="Vehicle Brand"
value={brand}
onChange={e=>setBrand(e.target.value)}
/>

<input
placeholder="Vehicle Model"
value={model}
onChange={e=>setModel(e.target.value)}
/>

<input
placeholder="Vehicle Number Plate"
value={vehicleNumber}
onChange={e=>setVehicleNumber(e.target.value)}
/>

<input
placeholder="Fuel Type"
value={fuel}
onChange={e=>setFuel(e.target.value)}
/>

<input
placeholder="Manufacture Year"
value={year}
onChange={e=>setYear(e.target.value)}
/>

<input
placeholder="Price Per Day"
value={price}
onChange={e=>setPrice(e.target.value)}
/>

<input
placeholder="Free KM per Day (Example: 250)"
value={freeKm}
onChange={e=>setFreeKm(e.target.value)}
/>

<input
placeholder="Extra Price per KM (Example: 12)"
value={extraPrice}
onChange={e=>setExtraPrice(e.target.value)}
/>

<h3>Select Vehicle Location</h3>

<MapPicker setLocation={setLocation} />

<label>Vehicle Image</label>

<input
type="file"
accept="image/*"
onChange={(e)=>setVehicleImage(e.target.files![0])}
/>

<label>Vehicle RC</label>

<input
type="file"
accept="image/*,.pdf"
onChange={(e)=>setRcFile(e.target.files![0])}
/>

<button
className="primary-btn"
onClick={addVehicle}
disabled={loading}
>

{loading ? "Submitting..." : "Submit Vehicle"}

</button>

</div>

)

}