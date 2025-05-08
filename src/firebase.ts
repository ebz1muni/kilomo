// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBOR5Rqeb3iIBfvXKbZTHsxCfcZQfJprQo",
  authDomain: "kilomo-6218d.firebaseapp.com",
  projectId: "kilomo-6218d",
  storageBucket: "kilomo-6218d.appspot.com",
  messagingSenderId: "889681052499",
  appId: "1:889681052499:web:a1f85cb962722a137557a6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
