import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export default function PharmacienOrdersScreen() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationOrder, setNotificationOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [sound, setSound] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' ou 'confirmed'
  const pharmacyId = auth.currentUser?.uid;
  const timerRef = useRef(null);
  const soundRef = useRef(null);

  // Charger les commandes EN ATTENTE
  useEffect(() => {
    if (!pharmacyId) return;

    try {
      const q = query(
        collection(db, 'users', pharmacyId, 'orders'),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const result = [];
        querySnapshot.forEach(doc => {
          result.push({ id: doc.id, ...doc.data() });
        });
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setPendingOrders(result);
        setLoading(false);

        // Si c'est la première commande, la notifier
        if (result.length > 0 && !notificationOrder) {
          showNotificationModal(result[0]);
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Erreur chargement commandes en attente:', e);
      setLoading(false);
    }
  }, [pharmacyId]);

  // Charger les commandes CONFIRMÉES
  useEffect(() => {
    if (!pharmacyId) return;

    try {
      const q = query(
        collection(db, 'users', pharmacyId, 'orders'),
        where('status', '==', 'confirmed')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const result = [];
        querySnapshot.forEach(doc => {
          result.push({ id: doc.id, ...doc.data() });
        });
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setConfirmedOrders(result);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Erreur chargement commandes confirmées:', e);
    }
  }, [pharmacyId]);

  // Charger et jouer le son de notification
  const playNotificationSound = async () => {
    try {
      // Utiliser un son web externe au lieu d'un fichier local
      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
        },
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = newSound;
      setSound(newSound);
    } catch (e) {
      console.log('Erreur chargement son:', e);
      // Continuer sans son si erreur
    }
  };

  // Arrêter le son
  const stopNotificationSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setSound(null);
    }
  };

  // Afficher le modal de notification
  const showNotificationModal = (order) => {
    setNotificationOrder(order);
    setTimeLeft(15);
    playNotificationSound();

    // Timer de 15 secondes
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopNotificationSound();
          setNotificationOrder(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Accepter la commande
  const acceptOrder = async () => {
    try {
      stopNotificationSound();
      clearInterval(timerRef.current);

      const orderRef = doc(db, 'users', pharmacyId, 'orders', notificationOrder.id);
      await updateDoc(orderRef, { status: 'confirmed' });

      // Aussi mettre à jour dans la collection globale (avec try-catch)
      try {
        const globalOrderRef = doc(db, 'orders', notificationOrder.id);
        await updateDoc(globalOrderRef, { status: 'confirmed' });
      } catch (globalErr) {
        console.log('Info: Document global non trouvé (normal si pas encore créé):', globalErr);
      }

      Alert.alert('Succès', 'Commande acceptée !');
      setNotificationOrder(null);

      // Si d'autres commandes en attente, notifier la suivante
      const remainingOrders = pendingOrders.filter(o => o.id !== notificationOrder.id);
      if (remainingOrders.length > 0) {
        showNotificationModal(remainingOrders[0]);
      }
    } catch (e) {
      console.error('Erreur acceptation:', e);
      Alert.alert('Erreur', 'Impossible d\'accepter la commande.');
    }
  };

  // Refuser la commande
  const rejectOrder = async () => {
    try {
      stopNotificationSound();
      clearInterval(timerRef.current);

      const orderRef = doc(db, 'users', pharmacyId, 'orders', notificationOrder.id);
      await updateDoc(orderRef, { status: 'rejected' });

      // Aussi mettre à jour dans la collection globale (avec try-catch)
      try {
        const globalOrderRef = doc(db, 'orders', notificationOrder.id);
        await updateDoc(globalOrderRef, { status: 'rejected' });
      } catch (globalErr) {
        console.log('Info: Document global non trouvé (normal si pas encore créé):', globalErr);
      }

      Alert.alert('Info', 'Commande refusée.');
      setNotificationOrder(null);

      // Si d'autres commandes en attente, notifier la suivante
      const remainingOrders = pendingOrders.filter(o => o.id !== notificationOrder.id);
      if (remainingOrders.length > 0) {
        showNotificationModal(remainingOrders[0]);
      }
    } catch (e) {
      console.error('Erreur refus:', e);
      Alert.alert('Erreur', 'Impossible de refuser la commande.');
    }
  };

  // Accepter une commande depuis la liste (manuellement)
  const acceptOrderItem = async (order) => {
    try {
      const orderRef = doc(db, 'users', pharmacyId, 'orders', order.id);
      await updateDoc(orderRef, { status: 'confirmed' });

      try {
        const globalOrderRef = doc(db, 'orders', order.id);
        await updateDoc(globalOrderRef, { status: 'confirmed' });
      } catch (globalErr) {
        console.log('Info: Document global non trouvé (normal si pas encore créé):', globalErr);
      }

      Alert.alert('Succès', 'Commande acceptée !');
    } catch (e) {
      console.error('Erreur acceptation (liste):', e);
      Alert.alert('Erreur', 'Impossible d\'accepter la commande.');
    }
  };

  // Refuser une commande depuis la liste (manuellement)
  const rejectOrderItem = async (order) => {
    try {
      const orderRef = doc(db, 'users', pharmacyId, 'orders', order.id);
      await updateDoc(orderRef, { status: 'rejected' });

      try {
        const globalOrderRef = doc(db, 'orders', order.id);
        await updateDoc(globalOrderRef, { status: 'rejected' });
      } catch (globalErr) {
        console.log('Info: Document global non trouvé (normal si pas encore créé):', globalErr);
      }

      Alert.alert('Info', 'Commande refusée.');
    } catch (e) {
      console.error('Erreur refus (liste):', e);
      Alert.alert('Erreur', 'Impossible de refuser la commande.');
    }
  };

  // Fermer le modal
  const closeNotification = () => {
    stopNotificationSound();
    clearInterval(timerRef.current);
    setNotificationOrder(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const displayedOrders = activeTab === 'pending' ? pendingOrders : confirmedOrders;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            En attente ({pendingOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'confirmed' && styles.tabActive]}
          onPress={() => setActiveTab('confirmed')}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.tabTextActive]}>
            Confirmées ({confirmedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>
        {activeTab === 'pending' ? 'Commandes en attente' : 'Commandes confirmées'}
      </Text>

      {displayedOrders.length === 0 ? (
        <Text style={styles.empty}>
          {activeTab === 'pending' ? 'Aucune commande en attente' : 'Aucune commande confirmée'}
        </Text>
      ) : (
        <FlatList
          data={displayedOrders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, activeTab === 'confirmed' && styles.cardConfirmed]}>
              <View style={styles.header}>
                <Text style={styles.client}>Client: {item.clientEmail}</Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleTimeString('fr-FR')}
                </Text>
              </View>

              <Text style={styles.label}>Articles :</Text>
              {item.items && item.items.map((med, idx) => (
                <Text key={idx} style={styles.item}>
                  • {med.name} x{med.quantity} = {med.total} DA
                </Text>
              ))}

              <View style={styles.footer}>
                <Text style={styles.total}>Total: {item.totalPrice} DA</Text>
              </View>

              {activeTab === 'pending' && (
                <View style={styles.orderButtons}>
                  <TouchableOpacity
                    style={[styles.orderBtn, styles.acceptBtn]}
                    onPress={() => acceptOrderItem(item)}
                  >
                    <Text style={styles.orderBtnText}>✓ Accepter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.orderBtn, styles.rejectBtn]}
                    onPress={() => rejectOrderItem(item)}
                  >
                    <Text style={styles.orderBtnText}>✕ Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      {/* Modal de notification avec appel téléphonique */}
      <Modal
        visible={!!notificationOrder}
        transparent
        animationType="slide"
        onRequestClose={closeNotification}
      >
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationModal}>
            <Text style={styles.notificationTitle}>📞 NOUVELLE COMMANDE</Text>

            <Text style={styles.timerText}>{timeLeft}s</Text>

            {notificationOrder && (
              <View style={styles.notificationContent}>
                <Text style={styles.notificationClient}>
                  Client: {notificationOrder.clientEmail || 'Inconnu'}
                </Text>

                <Text style={styles.notificationLabel}>Articles :</Text>
                {notificationOrder.items && notificationOrder.items.length > 0 ? (
                  notificationOrder.items.map((med, idx) => (
                    <Text key={idx} style={styles.notificationItem}>
                      • {med.name} x{med.quantity} = {med.total} DA
                    </Text>
                  ))
                ) : (
                  <Text style={styles.notificationItem}>Aucun article</Text>
                )}

                <Text style={styles.notificationTotal}>
                  Total: {notificationOrder.totalPrice || 0} DA
                </Text>
              </View>
            )}

            <View style={styles.notificationButtons}>
              <TouchableOpacity
                style={[styles.notificationBtn, styles.acceptBtn]}
                onPress={acceptOrder}
              >
                <Text style={styles.notificationBtnText}>✓ Accepter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.notificationBtn, styles.rejectBtn]}
                onPress={rejectOrder}
              >
                <Text style={styles.notificationBtnText}>✕ Refuser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },
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
  client: { fontWeight: 'bold', fontSize: 15 },
  time: { fontSize: 12, color: '#999' },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 5 },
  item: { fontSize: 13, color: '#555', marginLeft: 5, marginBottom: 3 },
  footer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  total: { fontWeight: 'bold', fontSize: 14, color: '#28A745' },

  // Notification Modal Styles
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  notificationContent: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  notificationClient: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 10,
  },
  notificationLabel: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 5,
  },
  notificationItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
    marginBottom: 3,
  },
  notificationTotal: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#28A745',
    marginTop: 10,
  },
  notificationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 10,
  },
  notificationBtn: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  acceptBtn: {
    backgroundColor: '#28A745',
  },
  rejectBtn: {
    backgroundColor: '#e74c3c',
  },
  notificationBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  cardConfirmed: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  orderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  orderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  orderBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
