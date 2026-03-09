import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/* ================= USER DATA TYPE ================= */

type UserData = {
  uid: string
  email: string
  first_name: string
  last_name: string
  username: string
  active_role: string
  is_customer: boolean
  is_driver: boolean
  is_owner: boolean
  is_admin: boolean
  photo?: string
}

/* ================= CONTEXT TYPE ================= */

type AuthContextType = {
  user: User | null
  userData: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    data: {
      first_name: string
      last_name: string
      username: string
    }
  ) => Promise<void>
  logout: () => Promise<void>
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType>(null as any)

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      setUser(u)

      if (u) {

        try {

          const snap = await getDoc(doc(db, "users", u.uid))

         if (snap.exists()) {

const data = snap.data() as any

if(data.banned){

alert("Your account has been banned. Contact admin: admin@gmail.com")

await signOut(auth)

setUser(null)
setUserData(null)

return
}

setUserData(data)

}

        } catch (err) {
          console.error("User fetch error:", err)
        }

      } else {

        setUserData(null)

      }

      setLoading(false)

    })

    return () => unsub()

  }, [])

  /* ================= LOGIN ================= */

  const login = async (email: string, password: string) => {

    await signInWithEmailAndPassword(auth, email, password)

  }

  /* ================= REGISTER ================= */

  const register = async (
    email: string,
    password: string,
    data: { first_name: string; last_name: string; username: string }
  ) => {

    const cred = await createUserWithEmailAndPassword(auth, email, password)

    const userDoc: UserData = {
      uid: cred.user.uid,
      email,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      active_role: "customer",
      is_customer: true,
      is_driver: false,
      is_owner: false,
      is_admin: false,
      photo: "",
    }

    await setDoc(doc(db, "users", cred.user.uid), {
      ...userDoc,
      created_at: serverTimestamp(),
    })

    setUserData(userDoc)

  }

  /* ================= LOGOUT ================= */

  const logout = async () => {

    await signOut(auth)

    setUser(null)
    setUserData(null)

  }

  /* ================= PROVIDER ================= */

  return (

    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        register,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  )

}

/* ================= HOOK ================= */

export const useAuth = () => useContext(AuthContext)