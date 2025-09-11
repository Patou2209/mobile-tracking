import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { db, auth } from "./firebase";
import { ref, update } from "firebase/database";

TaskManager.defineTask("locationTask", async ({ data, error }) => {
  if (error) {
    console.error("Erreur TaskManager:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    const loc = locations[0];
    if (!loc) return;

    const user = auth.currentUser; // 🔑 vrai utilisateur Firebase
    if (!user) return;

    const { latitude, longitude } = loc.coords;

    await update(ref(db, `locations/${user.uid}`), {
      lat: latitude,
      lng: longitude,
      ts: Date.now(),
    });

    await update(ref(db, `presence/${user.uid}`), {
      online: true,
      lastSeen: Date.now(),
    });
  }
});
// mobile/locationTask.js