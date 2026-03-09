import { signOut } from "firebase/auth"
import { auth } from "./firebase"

export async function logout(){

try{

await signOut(auth)

localStorage.removeItem("active_role")

}catch(error){

console.error("Logout error:",error)

}

}