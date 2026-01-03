import React, { useState } from 'react';
import { View, Text, FlatList, Switch, StyleSheet } from 'react-native';

export default function PharmacienOrdersScreen() {
  const [orders, setOrders] = useState([
    { id: '1', client: 'Client 1', status: 'En attente', available: true },
    { id: '2', client: 'Client 2', status: 'Acceptée', available: false },
  ]);

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Client : {item.client}</Text>
            <Text>Statut : {item.status}</Text>
            <Switch value={item.available} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
