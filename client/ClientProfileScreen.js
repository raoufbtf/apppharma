import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export default function ClientProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);

      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
          }
        } catch (e) {
          console.log('Erreur récupération profil:', e);
        }
      };

      fetchUserData();
    }
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e) {
      console.error('Erreur lors de la déconnexion:', e);
      Alert.alert('Erreur', "La déconnexion a échoué. Réessayez.");
    }
  };

  const initial = firstName
    ? firstName.charAt(0).toUpperCase()
    : email
    ? email.charAt(0).toUpperCase()
    : '?';

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      {/* Name */}
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

      {/* Email */}
      <Text style={styles.email}>{email}</Text>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // CENTER vertically
    alignItems: 'center',     // CENTER horizontally
    padding: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  avatarText: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },

  logoutBtn: {
    marginTop: 35,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 45,
    borderRadius: 10,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
