// src/firebase/config.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyB4B_oE1YayM5GHAslSu7cT4nKAbttbARQ",
  authDomain: "gymapp-21eca.firebaseapp.com",
  projectId: "gymapp-21eca",
  storageBucket: "gymapp-21eca.firebasestorage.app",
  messagingSenderId: "770969281288",
  appId: "1:770969281288:web:3ae10d2732c5ded851c2bd",
  measurementId: "G-TLBQQ4ZCP4"
}

const app = initializeApp(firebaseConfig)

// Analytics samo u browseru, ne u Node.js
isSupported().then(yes => { if (yes) getAnalytics(app) })

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
