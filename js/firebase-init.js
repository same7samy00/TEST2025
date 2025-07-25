
// js/firebase-init.js

// Import the functions you need from the SDKs you need using full CDN paths
// (يمكنك استخدام إصدار 10.0.0 أو 12.0.0 كما هو متاح لك في Firebase Console)
// حالياً، سنستخدم 12.0.0 بناءً على الكود الأخير الذي أرسلته.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"; // *** هذا استيراد جديد ومهم ***
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";     // *** هذا استيراد جديد ومهم ***

// Your web app's Firebase configuration
// (هذه هي القيم الخاصة بمشروعك التي أرسلتها في الصورة)
const firebaseConfig = {
  apiKey: "AIzaSyC5ls-rPdJ65x5BoMGwAOpdcPtD585C2ys",
  authDomain: "pharmacy-inventory-bf04a.firebaseapp.com",
  projectId: "pharmacy-inventory-bf04a",
  storageBucket: "pharmacy-inventory-bf04a.firebasestorage.app",
  messagingSenderId: "937788650384",
  appId: "1:937788650384:web:6451225d00e648f3a0b915",
  measurementId: "G-ZGC9EQ55SL"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // إذا كنت لا تحتاج لـ Analytics، يمكنك إزالة هذا السطر

// *** تهيئة Firestore و Authentication باستخدام كائن "app" ***
const db = getFirestore(app);     // تهيئة Firestore (للوصول إلى قاعدة البيانات)
const auth = getAuth(app);       // تهيئة Authentication (لإدارة تسجيل الدخول/الخروج)

// *** قم بتصدير 'app', 'analytics', 'db', و 'auth' لاستخدامها في ملفات JavaScript الأخرى (مثل main.js) ***
export { app, analytics, db, auth };
