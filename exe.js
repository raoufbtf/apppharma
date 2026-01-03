// seedMedicaments.js

import fs from "fs";
import csv from "csv-parser";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyACaimDkZCMtdp7vijHODn_Mml5-PlIC5c",
  authDomain: "tpmobile-a2ebd.firebaseapp.com",
  projectId: "tpmobile-a2ebd",
  storageBucket: "tpmobile-a2ebd.firebasestorage.app",
  messagingSenderId: "125817474694",
  appId: "1:125817474694:web:a61700b6c5b6abe3470b07",
  measurementId: "G-RSGZGL2EN4"
};

// 🔌 Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 Collection Firestore
const medicamentsRef = collection(db, "medicaments");

// 📥 Lire le CSV et insérer dans Firestore
async function seedMedicamentsFromCSV() {
  const medicaments = [];

  fs.createReadStream("medicines_cleaned.csv")
    .pipe(csv())
    .on("data", (row) => {
      medicaments.push({
        nom: row.Name,
        categorie: row.Category,
        createdAt: new Date()
      });
    })
    .on("end", async () => {
      try {
        for (const med of medicaments) {
          await addDoc(medicamentsRef, med);
          console.log(`✅ Ajouté : ${med.nom}`);
        }

        console.log("🎉 Tous les médicaments ont été ajoutés avec succès !");
      } catch (error) {
        console.error("❌ Erreur Firestore :", error);
      }
    });
}

// ▶️ Lancer le seed
seedMedicamentsFromCSV();
