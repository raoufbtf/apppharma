// seedMedicaments.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Remplace par ta config Firebase
const firebaseConfig = {
   apiKey: "AIzaSyACaimDkZCMtdp7vijHODn_Mml5-PlIC5c",
  authDomain: "tpmobile-a2ebd.firebaseapp.com",
  projectId: "tpmobile-a2ebd",
  storageBucket: "tpmobile-a2ebd.firebasestorage.app",
  messagingSenderId: "125817474694",
  appId: "1:125817474694:web:a61700b6c5b6abe3470b07",
  measurementId: "G-RSGZGL2EN4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Générer un médicament exemple
function generateMedicament(i) {
  const formes = ["Comprimé", "Gélule", "Sirop", "Injection"];
  return {
    nom: `Médicament ${i}`,
    dosage: `${50 + i * 5}mg`,
    form: formes[i % formes.length],
    description: `Description détaillée du médicament ${i}.`,
    createdAt: new Date()
  };
}

async function seedMedicaments() {
  try {
    const medicamentsRef = collection(db, "medicaments");

    for (let i = 1; i <= 100; i++) {
      const medicament = generateMedicament(i);
      await addDoc(medicamentsRef, medicament);
      console.log(`Ajouté : ${medicament.nom}`);
    }

    console.log("✅ 100 médicaments ajoutés !");
  } catch (error) {
    console.error("Erreur :", error);
  }
}

seedMedicaments();
