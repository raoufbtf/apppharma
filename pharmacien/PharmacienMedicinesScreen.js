import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput
} from "react-native";

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc
} from "firebase/firestore";

import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export default function PharmacienMedicinesScreen() {
  const userId = auth.currentUser?.uid;

  const [medicines, setMedicines] = useState([]);
  const [globalMedicines, setGlobalMedicines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [prix, setPrix] = useState("");
  const [loadingMedicines, setLoadingMedicines] = useState(false);

  /* =============================
     🔹 Charger médicaments du pharmacien
     ============================= */
  const loadUserMedicines = async () => {
    const ref = collection(db, "users", userId, "medicaments");
    const snap = await getDocs(ref);

    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setMedicines(list);
  };

  /* =============================
     🔹 Charger médicaments globaux
     ============================= */
  const loadGlobalMedicines = async () => {
    setLoadingMedicines(true);
    try {
      const snap = await getDocs(collection(db, "medicaments"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("Médicaments globaux chargés:", data.length, data);
      
      if (data.length === 0) {
        console.warn("Aucun médicament trouvé. Ajout de données de test...");
        // Données de test si la collection est vide
        const testMeds = [
          { name: "Aspirine", category: "Analgésiques" },
          { name: "Ibuprofène", category: "Anti-inflammatoires" },
          { name: "Paracétamol", category: "Analgésiques" },
          { name: "Amoxicilline", category: "Antibiotiques" },
          { name: "Metformine", category: "Antidiabétiques" },
          { name: "Lisinopril", category: "Antihypertenseurs" }
        ];
        setGlobalMedicines(testMeds);
      } else {
        setGlobalMedicines(data);
      }
    } catch (e) {
      console.error("Erreur loadGlobalMedicines:", e);
    } finally {
      setLoadingMedicines(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserMedicines();
      loadGlobalMedicines();
    }
  }, [userId]);

  /* =============================
     🔹 Toggle disponibilité
     ============================= */
  const toggleAvailability = async (id, value) => {
    const ref = doc(db, "users", userId, "medicaments", id);
    await updateDoc(ref, { available: value });

    setMedicines(prev =>
      prev.map(m => m.id === id ? { ...m, available: value } : m)
    );
  };

  /* =============================
     🔹 Ajouter médicament au pharmacien
     ============================= */
  const addMedicine = async (med) => {
    if (!prix) return;

    await addDoc(
      collection(db, "users", userId, "medicaments"),
      {
        name: med.name || med.nom,
        prix: parseFloat(prix),
        available: true,
        createdAt: new Date()
      }
    );

    setPrix("");
    setModalVisible(false);
    loadUserMedicines();
  };

  /* =============================
     🔹 Filtre recherche
     ============================= */
  const filtered = globalMedicines.filter(m => {
    const medicName = m?.name || m?.nom; // Support both 'name' and 'nom'
    if (!medicName) return false;
    const searchTrim = search.trim().toLowerCase();
    if (!searchTrim) return true; // Affiche tout si recherche vide
    return medicName.toLowerCase().includes(searchTrim);
  });

  return (
    <View style={styles.container}>

      {/* ===== Liste ===== */}
      {medicines.length === 0 ? (
        <Text style={styles.empty}>Aucun médicament</Text>
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.prix} DA</Text>
              </View>
              <Switch
                value={item.available}
                onValueChange={(v) =>
                  toggleAvailability(item.id, v)
                }
              />
            </View>
          )}
        />
      )}

      {/* ===== Bouton Ajouter ===== */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addText}>＋ Ajouter médicament</Text>
      </TouchableOpacity>

      {/* ===== Modal ===== */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>

          <TextInput
            placeholder="Rechercher médicament..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />

          <TextInput
            placeholder="Prix (DA)"
            value={prix}
            onChangeText={setPrix}
            keyboardType="numeric"
            style={styles.input}
          />

          {filtered.length === 0 ? (
            <Text style={styles.empty}>
              {loadingMedicines ? "Chargement..." : search ? "Aucun médicament trouvé" : "Tapez pour rechercher"}
            </Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.result}
                  onPress={() => addMedicine(item)}
                >
                  <Text style={{ fontWeight: "bold" }}>{item.name || item.nom}</Text>
                  <Text style={styles.category}>{item.category || item.categorie || "Catégorie N/A"}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.close}
            onPress={() => {
              setModalVisible(false);
              setSearch("");
              setPrix("");
            }}
          >
            <Text>Fermer</Text>
          </TouchableOpacity>

        </View>
      </Modal>

    </View>
  );
}

/* =============================
   🎨 Styles
   ============================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999"
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },

  name: { fontWeight: "bold" },
  price: { color: "#2e7d32" },

  addButton: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10
  },

  addText: {
    color: "#fff",
    fontWeight: "bold"
  },

  modal: { flex: 1, padding: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },

  result: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },

  category: {
    color: "#999",
    fontSize: 12
  },

  close: {
    alignItems: "center",
    padding: 15
  }
});
