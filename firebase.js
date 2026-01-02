// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- à ajouter
import { getAnalytics } from "firebase/analytics";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyACaimDkZCMtdp7vijHODn_Mml5-PlIC5c",
  authDomain: "tpmobile-a2ebd.firebaseapp.com",
  projectId: "tpmobile-a2ebd",
  storageBucket: "tpmobile-a2ebd.firebasestorage.app",
  messagingSenderId: "125817474694",
  appId: "1:125817474694:web:a61700b6c5b6abe3470b07",
  measurementId: "G-RSGZGL2EN4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
