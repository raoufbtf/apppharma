import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ClientHome() {
  const navigation = useNavigation();
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
    const fetchPharmaciesRealtime = () => {
      if (!location) return;

      try {
        const q = query(collection(db, 'users'), where('type', '==', 'pharmacien'));
        
        // Utiliser onSnapshot pour un listener en temps réel
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const result = [];
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.coords) {
              const dx = (data.coords.latitude - location.latitude) * 111;
              const dy = (data.coords.longitude - location.longitude) * 111;
              const distance = Math.sqrt(dx * dx + dy * dy);
              // Élargir le rayon à 10 km mais optimiser le rendu
              if (distance <= 10) {
                result.push({ id: doc.id, ...data, distance });
              }
            }
          });
          // Trier par distance pour un meilleur ordre d'affichage
          result.sort((a, b) => a.distance - b.distance);
          setPharmacies(result);
          setLoading(false);
        }, (error) => {
          console.error('Erreur listener pharmacies:', error);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    };
    
    fetchPharmaciesRealtime();
  }, [location]);

  // Mémoriser les marqueurs pour éviter les re-rendus inutiles
  const pharmacyMarkers = useMemo(() => {
    return pharmacies.map(pharma => (
      <Marker
        key={`${pharma.id}-${pharma.isOpen}`}
        coordinate={pharma.coords}
        title={pharma.pharmacyName || (pharma.firstName + ' ' + pharma.lastName)}
        description={
          pharma.isOpen 
            ? ('Pharmacie ouverte')
            : 'Pharmacie fermée'
        }
        onPress={() => {
          // Naviguer vers l'écran de commande de médicaments
          if (pharma.isOpen) {
            navigation.navigate('ClientMedicineOrder', {
              pharmacyId: pharma.id,
              pharmacyName: pharma.pharmacyName || (pharma.firstName + ' ' + pharma.lastName),
            });
          } else {
            alert('Cette pharmacie est fermée');
          }
        }}
      >
        <FontAwesome5 
          name="briefcase-medical" 
          size={30} 
          color={pharma.isOpen ? 'green' : 'red'} 
        />
      </Marker>
    ));
  }, [pharmacies, navigation]);

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
      {pharmacyMarkers}
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
