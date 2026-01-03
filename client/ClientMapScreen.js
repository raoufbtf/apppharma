import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ClientHome() {
  const [location, setLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return alert('Permission de localisation refusée');
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (!location) return;

      try {
        const q = query(collection(db, 'users'), where('type', '==', 'pharmacien'));
        const querySnapshot = await getDocs(q);
        const result = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.coords) {
            const dx = (data.coords.latitude - location.latitude) * 111;
            const dy = (data.coords.longitude - location.longitude) * 111;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 5) result.push({ id: doc.id, ...data });
          }
        });
        setPharmacies(result);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, [location]);

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker coordinate={location} title="Vous êtes ici" pinColor="blue" />
      {pharmacies.map(pharma => (
        <Marker
          key={pharma.id}
          coordinate={pharma.coords}
          title={pharma.firstName + ' ' + pharma.lastName}
          description={pharma.onDuty ? 'Pharmacie de garde' : 'Pharmacie ouverte'}
        />
      ))}
      <Circle
        center={location}
        radius={5000}
        strokeColor="rgba(0, 122, 255, 0.5)"
        fillColor="rgba(0, 122, 255, 0.1)"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
