import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function PharmacyMap({ navigation }) {

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission refusée');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setLoading(false);
    })();
  }, []);

  if (loading || !location) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handlePress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    setSelectedLocation({ latitude, longitude });

    // ➤ On renvoie les coordonnées à Register.js
    navigation.navigate("Register", {
      pharmacyCoords: {
        latitude,
        longitude,
      },
    });
  };

  return (
    <MapView
      style={styles.map}
      onPress={handlePress}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {selectedLocation && (
        <Marker
          coordinate={selectedLocation}
          title="Localisation sélectionnée"
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
