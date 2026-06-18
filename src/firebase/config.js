// src/firebase/config.js
// ⚠️  Zamijeni s tvojim Firebase projektom!
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4B_oE1YayM5GHAslSu7cT4nKAbttbARQ",
  authDomain: "gymapp-21eca.firebaseapp.com",
  projectId: "gymapp-21eca",
  storageBucket: "gymapp-21eca.firebasestorage.app",
  messagingSenderId: "770969281288",
  appId: "1:770969281288:web:3ae10d2732c5ded851c2bd",
  measurementId: "G-TLBQQ4ZCP4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
