import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function PharmacienProfileScreen() {
  const navigation = useNavigation();
  const uid = auth.currentUser.uid;

  const [pharmacyName, setPharmacyName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const logout = async () => {
    try {
      await auth.signOut();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error('Erreur lors de la déconnexion:', e);
      Alert.alert('Erreur', 'La déconnexion a échoué. Réessayez.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setPharmacyName(snap.data().pharmacyName || '');
        setIsOpen(snap.data().isOpen || false);
      }
    };
    loadData();
  }, []);

  const save = async () => {
    await updateDoc(doc(db, 'users', uid), {
      pharmacyName,
      isOpen,
    });
    alert('Informations mises à jour');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma pharmacie</Text>

      <Text>Nom public de la pharmacie</Text>
      <TextInput
        style={styles.input}
        value={pharmacyName}
        onChangeText={setPharmacyName}
        placeholder="Ex : Pharmacie El Amal"
      />

      <View style={styles.row}>
        <Text>Pharmacie ouverte</Text>
        <Switch value={isOpen} onValueChange={setIsOpen} />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={{ color: '#fff' }}>Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={{ color: '#fff' }}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  saveBtn: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutBtn: {
    marginTop: 15,
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
});
