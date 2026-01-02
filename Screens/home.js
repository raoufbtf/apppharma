import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from '../firebase'; // Pour la déconnexion si nécessaire
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const [medicaments, setMedicaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const db = getFirestore();

  useEffect(() => {
    const fetchMedicaments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "medicaments"));
        const meds = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMedicaments(meds);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicaments();
  }, []);

  const handleLogout = () => {
    // Optionnel : Déconnexion Firebase
    // signOut(auth);
    navigation.replace("Login");
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.nom}>{item.nom}</Text>
      <Text style={styles.details}>Dosage: {item.dosage}</Text>
      <Text style={styles.details}>Forme: {item.form}</Text>
      <Text style={styles.details}>{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text>Chargement des médicaments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des médicaments</Text>

      <FlatList
        data={medicaments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7fb' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  item: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e6e6f0' },
  nom: { fontSize: 18, fontWeight: '600' },
  details: { fontSize: 14, color: '#555', marginTop: 2 },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: { color: '#fff', fontWeight: '600' },
});
