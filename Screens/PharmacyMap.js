import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function PharmacyMap({ navigation, route }) {

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(route.params?.currentCoords || null);

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

    const coords = { latitude, longitude };
    setSelectedLocation(coords);

    // If a callback was passed from Register, call it so Register keeps its instance/state
    if (route.params?.onSelect && typeof route.params.onSelect === 'function') {
      try {
        route.params.onSelect(coords);
      } catch (err) {
        console.log('Erreur en appelant onSelect:', err);
      }
      navigation.goBack();
      return;
    }

    // Fallback: navigate back with params (may create a new instance depending on navigator)
    navigation.navigate("Register", { pharmacyCoords: coords });
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
