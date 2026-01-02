import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Register({ onRegister }) {
  const navigation = useNavigation();
  const route = useRoute();

  // Coordonnées envoyées par la carte
  const pharmacyCoords = route.params?.pharmacyCoords || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState("client");

  const validate = () => {
    if (!email) return 'Veuillez saisir un e-mail.';
    if (!password) return 'Veuillez saisir un mot de passe.';
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas.';
    if (type === "pharmacien" && !pharmacyCoords)
      return "Veuillez sélectionner l’emplacement de la pharmacie sur la carte.";

    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        type,
        createdAt: new Date(),
        coords: pharmacyCoords || null, // ✔️ ici on stocke les coordonnées
      });

      navigation.navigate("Login");

    } catch (e) {
      setError("Échec de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Créer un compte</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          {/* password */}
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
          />

          {/* confirm */}
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            secureTextEntry={secure}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* type user */}
          <View style={styles.row}>
            <Text>Client</Text>

            <Switch
              value={type === "pharmacien"}
              onValueChange={(v) => setType(v ? "pharmacien" : "client")}
            />

            <Text>Pharmacien</Text>
          </View>

          {/* bouton choisir la localisation */}
          {type === "pharmacien" && (
            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => navigation.navigate("PharmacyMap")}
            >
              <Text style={{ color: "#fff" }}>
                {pharmacyCoords ? "Localisation enregistrée ✔️" : "Choisir emplacement"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <Text style={{ color: "#fff" }}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  inner: { flex: 1, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  mapBtn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  registerBtn: {
    backgroundColor: "#28A745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});
