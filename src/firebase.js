import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCg1R4yhFJGAvhwCFL0FRDXh28E47KjSfA",
  authDomain: "akmembasystem.firebaseapp.com",
  projectId: "akmembasystem",
  storageBucket: "akmembasystem.firebasestorage.app",
  messagingSenderId: "537635204515",
  appId: "1:537635204515:web:fdfd2574b1341bb17b7e16",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);