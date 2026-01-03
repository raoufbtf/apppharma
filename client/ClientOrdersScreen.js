import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ClientOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientId = auth.currentUser?.uid;

  useEffect(() => {
    if (!clientId) return;

    try {
      // Récupérer les commandes du client depuis la collection globale "orders"
      // (Alternative: vous pouvez aussi faire plusieurs requêtes pour chaque pharmacie)
      const q = query(
        collection(db, 'orders'),
        where('clientId', '==', clientId)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const result = [];
        querySnapshot.forEach(doc => {
          result.push({ id: doc.id, ...doc.data() });
        });
        // Trier par date (plus récentes en premier)
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setOrders(result);
        setLoading(false);
      }, (error) => {
        console.error('Erreur chargement commandes:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Erreur:', e);
      setLoading(false);
    }
  }, [clientId]);

  // Fonction pour obtenir la couleur du status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'confirmed':
        return '#007AFF'; // Bleu
      case 'completed':
        return '#28A745'; // Vert
      default:
        return '#999';
    }
  };

  // Fonction pour obtenir le texte du status en français
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'completed':
        return 'Livrée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>

      {orders.length === 0 ? (
        <Text style={styles.empty}>Aucune commande</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.pharmacy}>{item.pharmacyName}</Text>
                <Text
                  style={[
                    styles.status,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {getStatusLabel(item.status)}
                </Text>
              </View>

              {/* Afficher les articles */}
              <Text style={styles.itemsLabel}>Articles :</Text>
              {item.items && item.items.map((med, idx) => (
                <Text key={idx} style={styles.item}>
                  • {med.name} x{med.quantity} = {med.total} DA
                </Text>
              ))}

              <View style={styles.footer}>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.total}>Total: {item.totalPrice} DA</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pharmacy: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  itemsLabel: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 5,
  },
  item: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
    marginBottom: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  total: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#28A745',
  },
});
