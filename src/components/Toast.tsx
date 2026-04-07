import { useEffect } from "react"

export default function Toast({message,type,onClose}:any){

useEffect(()=>{

const timer=setTimeout(()=>{
onClose()
},3000)

return ()=>clearTimeout(timer)

},[])

return(

<div className={`toast toast-${type}`}>

<span className="toast-icon">
{type==="success" && "✔"}
{type==="error" && "✖"}
{type==="warning" && "⚠"}
</span>

<span>{message}</span>

</div>

)

}
