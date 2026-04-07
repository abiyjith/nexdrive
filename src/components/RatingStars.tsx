import { useState } from "react"

export default function RatingStars({ rating, setRating }: any) {

const [hover, setHover] = useState(0)

return (

<div style={{fontSize:"24px", marginBottom:"10px"}}>

{[1,2,3,4,5].map((star)=>{

return(

<span
key={star}
style={{
cursor:"pointer",
color: star <= (hover || rating) ? "#facc15" : "#555",
marginRight:"5px"
}}
onClick={() => setRating(star)}
onMouseEnter={() => setHover(star)}
onMouseLeave={() => setHover(0)}
>
★
</span>

)

})}

</div>

)

}
