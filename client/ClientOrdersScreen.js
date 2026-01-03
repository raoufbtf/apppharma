import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function ClientOrdersScreen() {
  const orders = [
    { id: '1', pharmacy: 'Pharmacie Centrale', status: 'Livrée' },
    { id: '2', pharmacy: 'Pharmacie El Amal', status: 'En attente' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.pharmacy}>{item.pharmacy}</Text>
            <Text>Status : {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  pharmacy: { fontWeight: 'bold' },
});
