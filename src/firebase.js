import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4B_oE1YayM5GHAslSu7cT4nKAbttbARQ",
  authDomain: "gymapp-21eca.firebaseapp.com",
  projectId: "gymapp-21eca",
  storageBucket: "gymapp-21eca.firebasestorage.app",
  messagingSenderId: "770969281288",
  appId: "1:770969281288:web:3ae10d2732c5ded851c2bd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);