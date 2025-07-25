// script.js

import { db, auth } from './firebase-config.js'; // استيراد db و auth
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const sidebarLinks = document.querySelectorAll('#sidebar nav ul li a');
const logoutBtn = document.getElementById('logout-btn');
const currentUserSpan = document.getElementById('current-user-name');

// وظيفة لعرض القسم المطلوب وإخفاء الباقي
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // تحديث تفعيل الرابط في الشريط الجانبي
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
}

// مراقبة حالة المصادقة (تسجيل الدخول/الخروج)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // المستخدم مسجل الدخول
        authSection.style.display = 'none'; // إخفاء قسم تسجيل الدخول
        appSection.style.display = 'flex'; // إظهار التطبيق
        currentUserSpan.textContent = user.email; // عرض بريد المستخدم (يمكن استبداله بالاسم الحقيقي)
        showSection('dashboard'); // عرض لوحة التحكم الافتراضية
        console.log("User is logged in:", user.email);
    } else {
        // المستخدم غير مسجل الدخول
        authSection.style.display = 'block'; // إظهار قسم تسجيل الدخول
        appSection.style.display = 'none'; // إخفاء التطبيق
        console.log("User is logged out.");
    }
});

// التعامل مع تسجيل الدخول
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        authError.textContent = ''; // مسح أي رسائل خطأ سابقة
        console.log("Login successful!");
    } catch (error) {
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "صيغة البريد الإلكتروني غير صحيحة.";
        }
        authError.textContent = errorMessage;
        console.error("Login error:", error.message);
    }
});

// التعامل مع روابط الشريط الجانبي
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.target.dataset.section;
        if (sectionId) {
            showSection(sectionId);
        }
    });
});

// التعامل مع زر تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Logout error:", error.message);
    }
});

// ********** أمثلة على التفاعل مع Firestore (ستحتاج إلى تطويرها لاحقًا) **********

// مثال: جلب المنتجات من Firestore (فقط لتوضيح كيفية الاتصال)
async function getProducts() {
    try {
        const productsCol = collection(db, 'products'); // 'products' هو اسم الكوليكشن
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(doc => doc.data());
        console.log("Products from Firestore:", productList);
        // هنا يمكنك عرض المنتجات في واجهة المستخدم
    } catch (error) {
        console.error("Error getting products:", error);
    }
}

// يمكنك استدعاء getProducts() عند تحميل قسم المخزون مثلاً
// showSection('inventory').then(() => getProducts()); // هذا مثال، ستحتاج إلى ربطه بحدث التحميل الفعلي
