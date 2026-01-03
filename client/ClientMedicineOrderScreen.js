import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ClientMedicineOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { pharmacyId, pharmacyName } = route.params || {};

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState({});

  // Charger les médicaments disponibles de cette pharmacie
  useEffect(() => {
    const loadPharmacyMedicines = async () => {
      try {
        const ref = collection(db, 'users', pharmacyId, 'medicaments');
        const snap = await getDocs(ref);

        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(m => m.available === true); // Seulement les disponibles

        setMedicines(list);
      } catch (e) {
        console.error('Erreur chargement médicaments:', e);
      } finally {
        setLoading(false);
      }
    };

    if (pharmacyId) {
      loadPharmacyMedicines();
    }
  }, [pharmacyId]);

  // Filtrer les médicaments par recherche
  const filtered = medicines.filter(m => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return true;
    return (m.name || m.nom || '').toLowerCase().includes(searchLower);
  });

  // Ajouter/retirer un médicament du panier
  const toggleMedicine = (medId, quantity) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedMedicines };
      delete newSelected[medId];
      setSelectedMedicines(newSelected);
    } else {
      setSelectedMedicines({
        ...selectedMedicines,
        [medId]: quantity,
      });
    }
  };

  // Confirmer la commande
  const placeOrder = () => {
    const items = Object.entries(selectedMedicines).map(([medId, qty]) => {
      const med = medicines.find(m => m.id === medId);
      return {
        id: medId,
        name: med.name || med.nom,
        prix: med.prix,
        quantity: qty,
        total: med.prix * qty,
      };
    });

    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);

    // Vous pouvez sauvegarder la commande dans Firestore ici
    console.log('Commande:', {
      pharmacyId,
      pharmacyName,
      items,
      totalPrice,
      timestamp: new Date(),
    });

    alert(`Commande confirmée!\nTotal: ${totalPrice} DA`);
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const selectedCount = Object.keys(selectedMedicines).length;
  const totalPrice = Object.entries(selectedMedicines).reduce((sum, [medId, qty]) => {
    const med = medicines.find(m => m.id === medId);
    return sum + (med?.prix || 0) * qty;
  }, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{pharmacyName || 'Pharmacie'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un médicament..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Liste des médicaments */}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>
          {search ? 'Aucun médicament trouvé' : 'Aucun médicament disponible'}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.medicineCard}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{item.name || item.nom}</Text>
                <Text style={styles.medicinePrice}>{item.prix} DA</Text>
              </View>

              {/* Contrôle de quantité */}
              <View style={styles.quantityControl}>
                {selectedMedicines[item.id] ? (
                  <View style={styles.quantityBox}>
                    <TouchableOpacity
                      onPress={() =>
                        toggleMedicine(item.id, selectedMedicines[item.id] - 1)
                      }
                    >
                      <Text style={styles.quantityBtn}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>
                      {selectedMedicines[item.id]}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        toggleMedicine(item.id, selectedMedicines[item.id] + 1)
                      }
                    >
                      <Text style={styles.quantityBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => toggleMedicine(item.id, 1)}
                  >
                    <Text style={styles.addBtnText}>Ajouter</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Bouton commande en bas */}
      {selectedCount > 0 && (
        <View style={styles.footer}>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {selectedCount} article{selectedCount > 1 ? 's' : ''}
            </Text>
            <Text style={styles.summaryPrice}>{totalPrice} DA</Text>
          </View>
          <TouchableOpacity style={styles.orderBtn} onPress={placeOrder}>
            <Text style={styles.orderBtnText}>Commander</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  close: { fontSize: 24, color: '#999' },
  searchInput: {
    margin: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  medicineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  medicineInfo: { flex: 1 },
  medicineName: { fontWeight: '600', fontSize: 15 },
  medicinePrice: { color: '#28A745', fontWeight: 'bold', marginTop: 4 },
  quantityControl: { alignItems: 'center' },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
  },
  quantityBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  footer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: { fontSize: 14, color: '#666' },
  summaryPrice: { fontSize: 18, fontWeight: 'bold', color: '#28A745' },
  orderBtn: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
