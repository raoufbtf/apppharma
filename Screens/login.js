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
import { useNavigation } from '@react-navigation/native';

// Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";


export default function Login({ onLogin }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    setError('');
    if (!email) return 'Veuillez saisir un e-mail.';
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) return "L'adresse e-mail n'est pas valide.";
    if (!password) return 'Veuillez saisir le mot de passe.';
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
    return null;
  };

  const handleLogin = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // ➤ 1) Connexion Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (onLogin) onLogin(user);

      // ➤ 2) Récupérer le rôle depuis Firestore
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setError("Erreur : le type d'utilisateur n'existe pas dans Firestore.");
        return;
      }

      const userData = snap.data();
      const type = userData.type;

      console.log("Type utilisateur :", type);

      // ➤ 3) Redirection selon type
      if (type === "client") {
        navigation.navigate("Home");
      } else if (type === "pharmacien") {
        navigation.navigate("Home");
      } 

    } catch (e) {
      console.error("Erreur de connexion Firebase :", e.message);
      setError("Identifiants incorrects ou problème serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.inner, { justifyContent: 'flex-start' }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>Bienvenue</Text>
            <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@domaine.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="username"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Mot de passe</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Votre mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                textContentType="password"
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Text style={styles.showBtn}>{secure ? 'Afficher' : 'Masquer'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowSpace}>
              <View style={styles.rememberRow}>
                <Switch value={remember} onValueChange={setRemember} />
                <Text style={styles.rememberText}>Se souvenir de moi</Text>
              </View>

              <TouchableOpacity>
                <Text style={styles.forgot}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Se connecter</Text>}
            </TouchableOpacity>

            <Text style={styles.orText}>— ou —</Text>

            <View style={styles.signupRow}>
              <Text>Pas de compte ?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signupLink}> S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}


/* ——————————————————————————————————————————————— */
/*                        STYLES                      */
/* ——————————————————————————————————————————————— */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fb' },
  inner: { flex: 1, padding: 24, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#666', marginTop: 6 },
  form: { marginTop: 20 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e6f0',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  showBtn: { marginLeft: 8, color: '#007AFF', fontWeight: '600' },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { marginLeft: 8 },
  forgot: { color: '#007AFF' },
  loginBtn: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  loginText: { color: '#fff', fontWeight: '700' },
  orText: { textAlign: 'center', marginTop: 16, color: '#888' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  signupLink: { color: '#007AFF', fontWeight: '700' },
  error: { color: '#b00020', textAlign: 'center', marginTop: 8 },
});
