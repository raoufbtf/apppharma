import React, { useState } from 'react';
import { View, Text, FlatList, Switch, StyleSheet } from 'react-native';

export default function PharmacienMedicinesScreen() {
  const [medicines, setMedicines] = useState([
    { id: '1', name: 'Paracétamol', available: true },
    { id: '2', name: 'Amoxicilline', available: false },
  ]);

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.name}</Text>
            <Switch
              value={item.available}
              onValueChange={(v) =>
                setMedicines(prev =>
                  prev.map(m => m.id === item.id ? { ...m, available: v } : m)
                )
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
