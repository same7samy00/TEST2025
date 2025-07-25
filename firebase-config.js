// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"; // لإضافة Firestore
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js"; // لإضافة Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5ls-rPdJ65x5BoMGwAOpdcPtD585C2ys",
  authDomain: "pharmacy-inventory-bf04a.firebaseapp.com",
  projectId: "pharmacy-inventory-bf04a",
  storageBucket: "pharmacy-inventory-bf04a.firebasestorage.app",
  messagingSenderId: "937788650384",
  appId: "1:937788650384:web:6451225d00e648f3a0b915",
  measurementId: "G-ZGC9EQ55SL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // تهيئة Firestore
const auth = getAuth(app); // تهيئة Authentication

// تصدير الكائنات للاستخدام في ملفات JavaScript الأخرى
export { app, analytics, db, auth };
