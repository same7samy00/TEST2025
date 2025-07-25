// js/firebase-init.js

// Import the functions you need from the SDKs you need using full CDN paths
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"; // *** هذا استيراد جديد ومهم ***
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";     // *** هذا استيراد جديد ومهم ***

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5ls-rPdJ65x5BoMGwAOpdcPtD585C2ys", // قيمك هنا (موجودة لديك بالفعل)
  authDomain: "pharmacy-inventory-bf04a.firebaseapp.com", // قيمك هنا
  projectId: "pharmacy-inventory-bf04a", // قيمك هنا
  storageBucket: "pharmacy-inventory-bf04a.firebasestorage.app", // قيمك هنا
  messagingSenderId: "937788650384", // قيمك هنا
  appId: "1:937788650384:web:6451225d00e648f3a0b915", // قيمك هنا
  measurementId: "G-ZGC9EQ55SL" // قيمك هنا
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 

// *** أضف هذين السطرين لتهيئة Firestore و Authentication ***
const db = getFirestore(app);     // تهيئة Firestore (للوصول إلى قاعدة البيانات)
const auth = getAuth(app);       // تهيئة Authentication (لإدارة تسجيل الدخول/الخروج)

// *** أضف هذا السطر لتصدير الكائنات بحيث تكون متاحة لـ main.js ***
export { app, analytics, db, auth };
