import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Agregamos Auth y Firestore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC50Jh-u8TD8KWWSL-TsUNLkVd3UugN2lk",
  authDomain: "sal-pimienta-213d8.firebaseapp.com",
  projectId: "sal-pimienta-213d8",
  storageBucket: "sal-pimienta-213d8.firebasestorage.app",
  messagingSenderId: "417997187984",
  appId: "1:417997187984:web:c8aca4d091bb9def0d2115",
  measurementId: "G-TCVE0HNPTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportamos los servicios para usarlos en otros archivos
export const auth = getAuth(app);
export const db = getFirestore(app);