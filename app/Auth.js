// Mobile/Auth.js
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    try {
      let userCred;
      if (isSignup) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }
      setMessage("Connexion réussie !");
      onLogin(userCred.user);
    } catch (err) {
      setMessage("Mot de passe ou email incorrect.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? "Inscription" : "Connexion"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {isSignup ? "Créer un compte" : "Se connecter"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.link}>
          {isSignup ? "Déjà inscrit ? Se connecter" : "Pas encore de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    maxWidth: 300,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#333",
  },
  
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    color: "#1976d2",
    fontWeight: "bold",
  },
  message: {
    marginTop: 10,
    color: "red",
  },
});
