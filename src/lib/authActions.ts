// src/lib/authActions.ts

import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * Register new user
 */
export async function registerUser(
  email: string,
  password: string,
  role: "customer" | "owner" | "driver"
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    role,
    createdAt: new Date(),
  });

  return cred.user;
}

/**
 * Login existing user
 */
export async function loginUser(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Logout
 */
export async function logoutUser() {
  await signOut(auth);
}