import { doc,updateDoc } from "firebase/firestore"
import { db } from "./firebase"

export async function switchRole(uid:string,role:string){

await updateDoc(doc(db,"users",uid),{

active_role:role

})

window.location.reload()

}