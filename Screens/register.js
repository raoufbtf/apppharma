import React, { useState, useEffect } from 'react';
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
import MapView, { Marker } from 'react-native-maps';

// Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Register() {
  const navigation = useNavigation();
  const route = useRoute();

  // 🔹 Nouveaux champs pour Nom et Prénom
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState("client");
  const [onDuty, setOnDuty] = useState(false); // Pharmacie de garde

  // 🔹 Coordonnées de la pharmacie sélectionnées
  const [pharmacyCoords, setPharmacyCoords] = useState(null);

  // 🔹 Récupérer les coordonnées depuis PharmacyMap si on revient avec params
  useEffect(() => {
    if (route.params?.pharmacyCoords) {
      setPharmacyCoords(route.params.pharmacyCoords);
    }
  }, [route.params?.pharmacyCoords]);

  const validate = () => {
    if (!firstName) return 'Veuillez saisir votre prénom.';
    if (!lastName) return 'Veuillez saisir votre nom.';
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

      // 🔹 Envoyer toutes les infos à Firebase
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        type,
        createdAt: new Date(),
        coords: pharmacyCoords || null,
        onDuty: type === "pharmacien" ? onDuty : null,
      });

      navigation.navigate("Login");

    } catch (e) {
      setError("Échec de l'inscription.");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Créer un compte</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Nom et Prénom */}
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Mot de passe"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.showBtn}>
              <Text style={{ color: "#007AFF" }}>{secure ? "Afficher" : "Cacher"}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm password */}
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirmer le mot de passe"
              secureTextEntry={secure}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.showBtn}>
              <Text style={{ color: "#007AFF" }}>{secure ? "Afficher" : "Cacher"}</Text>
            </TouchableOpacity>
          </View>

          {/* Choix du type */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.typeBtn, type === "client" && styles.typeSelected]}
              onPress={() => setType("client")}
            >
              <Text style={type === "client" ? styles.typeTextSelected : styles.typeText}>Client</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, type === "pharmacien" && styles.typeSelected]}
              onPress={() => setType("pharmacien")}
            >
              <Text style={type === "pharmacien" ? styles.typeTextSelected : styles.typeText}>Pharmacien</Text>
            </TouchableOpacity>
          </View>

          {/* Mini carte pour pharmacien */}
          {type === "pharmacien" && pharmacyCoords && (
            <View style={{ height: 150, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: pharmacyCoords.latitude,
                  longitude: pharmacyCoords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={pharmacyCoords} title="Ma pharmacie" />
              </MapView>
            </View>
          )}

          {/* Checkbox Pharmacie de garde */}
          {type === "pharmacien" && (
            <View style={styles.row}>
              <Text>Pharmacie de garde ?</Text>
              <Switch value={onDuty} onValueChange={setOnDuty} />
            </View>
          )}

          {/* Choisir la localisation pour pharmacien */}
          {type === "pharmacien" && (
            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => navigation.navigate("PharmacyMap", { currentCoords: pharmacyCoords, onSelect: setPharmacyCoords })}
            >
              <Text style={{ color: "#fff" }}>
                {pharmacyCoords ? "Localisation enregistrée ✔️" : "Choisir emplacement"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff" }}>S'inscrire</Text>
            )}
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
  passwordRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  showBtn: { marginLeft: 10 },
  row: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20, alignItems: 'center' },
  typeBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    width: 120,
    alignItems: "center",
  },
  typeSelected: { backgroundColor: "#007AFF" },
  typeText: { color: "#007AFF", fontWeight: "bold" },
  typeTextSelected: { color: "#fff", fontWeight: "bold" },
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
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});
