// Mobile/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCDGo_P0fJ1j1HrZ1hpi9Uyd3nWnIBk6Bw",
  authDomain: "live-tracking-gps-technoweb.firebaseapp.com",
  databaseURL: "https://live-tracking-gps-technoweb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "live-tracking-gps-technoweb",
  storageBucket: "live-tracking-gps-technoweb.appspot.com",
  messagingSenderId: "26999020261",
  appId: "1:26999020261:web:5295385342531fbe70520c"
};

// Initialiser l’app Firebase
const app = initializeApp(firebaseConfig);

// ✅ Exporter Auth et Database
export const auth = getAuth(app);
export const db = getDatabase(app);

// Exemple utilitaire pour sauvegarder la position
export const saveLocation = async (userId, location) => {
  await set(ref(db, "locations/" + userId), {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    ts: Date.now(),
  });
};

