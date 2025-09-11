import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, update, set } from "firebase/database";
import { auth, db } from "../firebase";
import Auth from "./Auth";
import "../locationTask"; // important pour enregistrer la tâche background

export default function App() {
  const [user, setUser] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState(null);

  // Authentification
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Démarrer le partage
  const startSharing = async () => {
    if (!user) return;

    // Demander permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission de localisation refusée");
      return;
    }
    await Location.requestBackgroundPermissionsAsync();

    // Créer le user dans Firebase s’il n’existe pas
    await set(ref(db, `users/${user.uid}`), {
      name: user.email,
      createdAt: Date.now(),
    });

    // Démarrer background
    await Location.startLocationUpdatesAsync("locationTask", {
      accuracy: Location.Accuracy.Highest,
      distanceInterval: 10, // mise à jour chaque 10m
      deferredUpdatesInterval: 10000,
      showsBackgroundLocationIndicator: true,
    });

    setSharing(true);
  };

  // Arrêter le partage
  const stopSharing = async () => {
    await Location.stopLocationUpdatesAsync("locationTask");
    setSharing(false);

    if (user) {
      update(ref(db, `presence/${user.uid}`), {
        online: false,
        lastSeen: Date.now(),
      }).catch(() => {});
    }
  };

  // Récupération position en foreground pour l’affichage
  useEffect(() => {
    let sub;
    if (sharing) {
      (async () => {
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
          },
          (pos) => {
            setLocation(pos.coords);

            // Update Firebase en direct
            update(ref(db, `locations/${user.uid}`), {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              ts: Date.now(),
            });

            update(ref(db, `presence/${user.uid}`), {
              online: true,
              lastSeen: Date.now(),
            });
          }
        );
      })();
    }
    return () => sub && sub.remove();
  }, [sharing]);

  // Non connecté → page Auth
  if (!user) return <Auth onLogin={(u) => setUser(u)} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Bienvenue, {user.email}</Text>

      <MapView
        style={styles.map}
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : {
                latitude: -4.3, // Kinshasa par défaut
                longitude: 15.3,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
        }
        showsUserLocation
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            pinColor="green"
          />
        )}
      </MapView>

      <View style={styles.controls}>
        {!sharing ? (
          <TouchableOpacity style={[styles.btn, styles.start]} onPress={startSharing}>
            <Text style={styles.btnText}>Démarrer le partage</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sharing}>
            <TouchableOpacity style={[styles.btn, styles.stop]} onPress={stopSharing}>
              <Text style={styles.btnText}>Stopper le partage</Text>
            </TouchableOpacity>
            <Text style={styles.status}>📡 Partage en cours...</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.btn, styles.logout]} onPress={() => signOut(auth)}>
          <Text style={styles.btnText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc" },
  title: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  map: { flex: 1, margin: 10, borderRadius: 12 },
  controls: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  btn: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  start: { backgroundColor: "#2ecc71" },
  stop: { backgroundColor: "#e74c3c" },
  logout: { backgroundColor: "#2c3e50" },
  status: { marginTop: 10, color: "#2ecc71", textAlign: "center" },
  sharing: { alignItems: "center" },
});
