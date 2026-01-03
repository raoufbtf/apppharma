import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';

export default function ClientProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const logout = async () => {
    try {
      await auth.signOut();
      // Reset navigation stack to Login to prevent going back
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error('Erreur lors de la déconnexion:', e);
      Alert.alert('Erreur', "La déconnexion a échoué. Réessayez.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon compte</Text>

      <Text>Email : {user?.email}</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={{ color: '#fff' }}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
});
