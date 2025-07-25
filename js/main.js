// js/main.js

// Import Firebase services from the initialization file
import { db, auth } from "./firebase-init.js";
// Import specific functions from Firebase SDKs that you'll use
// (تأكد من استخدام نفس الإصدار في firebase-init.js)
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// DOM Elements (عناصر الواجهة التي سنتعامل معها)
const authStatusDiv = document.getElementById('auth-status');
const loginLink = document.getElementById('login-link');
const logoutLink = document.getElementById('logout-link');
const contentArea = document.getElementById('content-area');
const dashboardLink = document.getElementById('dashboard-link'); 
const productsLink = document.getElementById('products-link');
const salesLink = document.getElementById('sales-link');
const customersLink = document.getElementById('customers-link');
const reportsLink = document.getElementById('reports-link');

// --- 1. Authentication Logic (منطق تسجيل الدخول/الخروج) ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        authStatusDiv.classList.remove('alert-info', 'alert-danger');
        authStatusDiv.classList.add('alert-success');
        authStatusDiv.textContent = `مرحباً، ${user.email}! أنت مسجل الدخول.`;
        loginLink.classList.add('d-none');
        logoutLink.classList.remove('d-none');
        loadDashboard(); 
    } else {
        authStatusDiv.classList.remove('alert-success');
        authStatusDiv.classList.add('alert-info');
        authStatusDiv.textContent = 'يرجى تسجيل الدخول.';
        loginLink.classList.remove('d-none');
        logoutLink.classList.add('d-none');
        showLoginForm(); 
    }
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Error signing out:", error.message);
        alert(`خطأ في تسجيل الخروج: ${error.message}`);
    }
});

function showLoginForm() {
    contentArea.innerHTML = `
        <div class="card p-4 mx-auto" style="max-width: 400px;">
            <h2 class="card-title text-center mb-4">تسجيل الدخول</h2>
            <div class="mb-3">
                <label for="emailInput" class="form-label">البريد الإلكتروني:</label>
                <input type="email" class="form-control" id="emailInput" placeholder="أدخل البريد الإلكتروني">
            </div>
            <div class="mb-3">
                <label for="passwordInput" class="form-label">كلمة المرور:</label>
                <input type="password" class="form-control" id="passwordInput" placeholder="أدخل كلمة المرور">
            </div>
            <button id="loginBtn" class="btn btn-primary w-100">تسجيل الدخول</button>
            <div id="loginError" class="alert alert-danger mt-3 d-none"></div>
        </div>
    `;

    document.getElementById('loginBtn').addEventListener('click', async () => {
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const loginErrorDiv = document.getElementById('loginError');

        loginErrorDiv.classList.add('d-none');

        if (!email || !password) {
            loginErrorDiv.textContent = 'البريد الإلكتروني وكلمة المرور مطلوبان.';
            loginErrorDiv.classList.remove('d-none');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            let errorMessage = "حدث خطأ غير معروف.";
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'صيغة البريد الإلكتروني غير صحيحة.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'لقد قمت بمحاولات عديدة. يرجى المحاولة لاحقاً.';
                    break;
                default:
                    errorMessage = `خطأ في تسجيل الدخول: ${error.message}`;
            }
            loginErrorDiv.textContent = errorMessage;
            loginErrorDiv.classList.remove('d-none');
            console.error("Login error:", error.code, error.message);
        }
    });
}


// --- 2. Dashboard / Default Content (لوحة التحكم الرئيسية) ---
dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) { 
        loadDashboard();
    } else {
        alert('يرجى تسجيل الدخول لعرض لوحة التحكم.');
        showLoginForm();
    }
});

function loadDashboard() {
    contentArea.innerHTML = `
        <h2 class="text-center">لوحة التحكم</h2>
        <p>مرحباً بك في لوحة تحكم نظام الصيدلية. اختر خياراً من القائمة أعلاه.</p>
        <div class="row text-center mt-4">
            <div class="col-md-4 mb-3">
                <div class="card p-3">
                    <h4><i class="bi bi-box-seam"></i> إدارة المنتجات</h4>
                    <p>إضافة، تعديل، وعرض المنتجات والمخزون.</p>
                    <button class="btn btn-info" id="quick-products-link">اذهب للمنتجات</button>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card p-3">
                    <h4><i class="bi bi-cart"></i> نقطة البيع</h4>
                    <p>إتمام عمليات البيع بسرعة وفعالية.</p>
                    <button class="btn btn-success" id="quick-sales-link">ابدأ البيع</button>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card p-3">
                    <h4><i class="bi bi-people"></i> إدارة العملاء والديون</h4>
                    <p>تتبع العملاء وإدارة الحسابات الآجلة.</p>
                    <button class="btn btn-warning" id="quick-customers-link">اذهب للعملاء</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('quick-products-link').addEventListener('click', () => loadProductsContent());
    document.getElementById('quick-sales-link').addEventListener('click', () => loadSalesContent());
    document.getElementById('quick-customers-link').addEventListener('click', () => loadCustomersContent());
}


// --- 3. Product Management (إدارة المنتجات - CRUD Operations with Firestore) ---
productsLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) {
        loadProductsContent();
    } else {
        alert('يرجى تسجيل الدخول لعرض المنتجات.');
        showLoginForm();
    }
});

async function loadProductsContent() {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">إدارة المنتجات</h2>
        <div class="input-group mb-3">
            <input type="text" class="form-control" id="productSearchInput" placeholder="ابحث بالاسم أو الباركود...">
            <button class="btn btn-outline-secondary" type="button" id="productSearchBtn"><i class="bi bi-search"></i> بحث</button>
            <button class="btn btn-info" type="button" id="scanBarcodeBtn"><i class="bi bi-qr-code-scan"></i> مسح باركود</button>
        </div>
        <div id="scanner-container" style="width:100%; max-width:400px; display:none; margin: 10px auto;"></div>

        <button class="btn btn-primary mb-3" id="addProductBtn"><i class="bi bi-plus-lg"></i> إضافة منتج جديد</button>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>الباركود</th>
                        <th>السعر</th>
                        <th>الكمية المتوفرة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="productsTableBody">
                    <tr><td colspan="5" class="text-center">جارٍ تحميل المنتجات...</td></tr>
                </tbody>
            </table>
        </div>
        <div id="productAlerts" class="mt-4">
            <h4><i class="bi bi-exclamation-triangle-fill text-warning"></i> تنبيهات المخزون والصلاحية</h4>
            <ul id="stockExpiryAlerts" class="list-group">
                <li class="list-group-item list-group-item-info">لا توجد تنبيهات حالياً.</li>
            </ul>
        </div>
    `;
    
    document.getElementById('addProductBtn').addEventListener('click', showAddProductForm);
    document.getElementById('productSearchBtn').addEventListener('click', () => fetchProducts(document.getElementById('productSearchInput').value));
    document.getElementById('productSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchProducts(document.getElementById('productSearchInput').value);
        }
    });
    document.getElementById('scanBarcodeBtn').addEventListener('click', startBarcodeScanner); // NEW: Barcode Scanner Button

    await fetchProducts(); // Fetch all products initially
}

// Global variable for scanner
let html5QrCodeScanner = null;

async function startBarcodeScanner() {
    const scannerContainer = document.getElementById('scanner-container');
    scannerContainer.style.display = 'block'; // Show scanner container
    scannerContainer.innerHTML = '<div id="reader" style="width: 100%;"></div><button class="btn btn-danger mt-2" id="stopScannerBtn">إيقاف الماسح</button>';

    if (!html5QrCodeScanner) {
        html5QrCodeScanner = new Html5Qrcode("reader");
    }

    const qrboxFunction = function(viewfinderWidth, viewfinderHeight) {
        let minEdgePercentage = 0.7; // 70% of the narrower edge
        let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
            width: qrboxSize,
            height: qrboxSize
        };
    };

    html5QrCodeScanner.start(
        { facingMode: "environment" }, // Prefer rear camera
        {
            fps: 10,    // Frames per second
            qrbox: qrboxFunction, // Make QR box responsive
            // If you want to use front camera: { facingMode: "user" }
        },
        (decodedText, decodedResult) => {
            // on success callback
            console.log(`Scan result: ${decodedText}`, decodedResult);
            document.getElementById('productSearchInput').value = decodedText; // Fill search input
            fetchProducts(decodedText); // Search product automatically
            stopBarcodeScanner(); // Stop scanner after successful scan
        },
        (errorMessage) => {
            // parse error, ideally ignore it.
            // console.warn(`QR Code no longer in scan region. ${errorMessage}`);
        }
    )
    .catch((err) => {
        // Start failed, usually camera permission issue
        console.error(`Unable to start scanning: ${err}`);
        alert(`لا يمكن بدء الماسح الضوئي. تأكد من إعطاء إذن الكاميرا. الخطأ: ${err.message}`);
        stopBarcodeScanner(); // Ensure UI cleans up
    });

    document.getElementById('stopScannerBtn').addEventListener('click', stopBarcodeScanner);
}

function stopBarcodeScanner() {
    if (html5QrCodeScanner && html5QrCodeScanner.is ).is ) && typeof html5QrCodeScanner.stop === 'function') {
        html5QrCodeScanner.stop().then((ignore) => {
            console.log("Scanner stopped.");
            document.getElementById('scanner-container').style.display = 'none'; // Hide scanner
            document.getElementById('scanner-container').innerHTML = ''; // Clear scanner content
        }).catch((err) => {
            console.error("Error stopping scanner:", err);
        });
    } else {
        document.getElementById('scanner-container').style.display = 'none'; // Hide scanner
        document.getElementById('scanner-container').innerHTML = ''; // Clear scanner content
    }
}


async function fetchProducts(searchTerm = '') {
    const productsTableBody = document.getElementById('productsTableBody');
    productsTableBody.innerHTML = ''; // مسح المحتوى السابق
    const stockExpiryAlertsList = document.getElementById('stockExpiryAlerts');
    stockExpiryAlertsList.innerHTML = ''; // مسح التنبيهات السابقة

    let productsRef = collection(db, "products");
    let q;

    if (searchTerm) {
        const isBarcodeSearch = /^\d+$/.test(searchTerm) && searchTerm.length >= 8; // Heuristic for barcode (e.g., EAN-13 has 13 digits)
        if (isBarcodeSearch) {
            q = query(productsRef, where("barcode", "==", searchTerm));
        } else {
            // For text search (name), use startAt/endAt for "starts with" functionality
            q = query(productsRef, orderBy("name"), where("name", ">=", searchTerm), where("name", "<=", searchTerm + '\uf8ff'));
        }

    } else {
        q = query(productsRef, orderBy("name", "asc"));
    }

    try {
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            productsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">لا يوجد منتجات مطابقة أو مسجلة.</td></tr>';
            stockExpiryAlertsList.innerHTML = '<li class="list-group-item list-group-item-info">لا توجد تنبيهات حالياً.</li>';
            return;
        }

        let hasAlerts = false;
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        snapshot.forEach(async (productDoc) => {
            const product = productDoc.data();
            const productId = productDoc.id;

            let totalQuantity = 0;
            const batchesRef = collection(db, `products/${productId}/batches`);
            const batchesSnapshot = await getDocs(batchesRef);
            
            batchesSnapshot.forEach(batchDoc => {
                const batch = batchDoc.data();
                const batchId = batchDoc.id;
                totalQuantity += batch.quantity || 0;

                const expiryDate = new Date(batch.expiryDate + 'T00:00:00'); // Add T00:00:00 for correct date parsing

                // تنبيهات الصلاحية
                if (expiryDate < today) {
                    stockExpiryAlertsList.innerHTML += `<li class="list-group-item list-group-item-danger">المنتج ${product.name} - الدفعة ${batch.batchNumber} منتهية الصلاحية (انتهت في: ${batch.expiryDate}). الكمية: ${batch.quantity}</li>`;
                    hasAlerts = true;
                } else if (expiryDate <= thirtyDaysLater) {
                    stockExpiryAlertsList.innerHTML += `<li class="list-group-item list-group-item-warning">المنتج ${product.name} - الدفعة ${batch.batchNumber} قريبة من الانتهاء (ينتهي في: ${batch.expiryDate}). الكمية: ${batch.quantity}</li>`;
                    hasAlerts = true;
                }
            });
            
            // تنبيهات الكمية المنخفضة
            if (totalQuantity <= (product.minStockLevel || 5)) {
                stockExpiryAlertsList.innerHTML += `<li class="list-group-item list-group-item-danger">المنتج ${product.name} - الكمية الكلية (${totalQuantity}) أقل من أو تساوي الحد الأدنى (${product.minStockLevel || 5}).</li>`;
                hasAlerts = true;
            }


            productsTableBody.innerHTML += `
                <tr>
                    <td>${product.name}<br><small class="text-muted">المصنع: ${product.manufacturer || 'غير محدد'}</small></td>
                    <td>${product.barcode || 'N/A'}</td>
                    <td>${product.price}</td>
                    <td>${totalQuantity}</td>
                    <td>
                        <button class="btn btn-sm btn-info edit-product-btn" data-id="${productId}"><i class="bi bi-pencil-square"></i> تعديل المنتج</button>
                        <button class="btn btn-sm btn-warning add-batch-btn" data-id="${productId}" data-name="${product.name}"><i class="bi bi-box-fill"></i> إضافة دفعة</button>
                        <button class="btn btn-sm btn-primary view-batches-btn" data-id="${productId}" data-name="${product.name}"><i class="bi bi-eye"></i> عرض الدفعات</button>
                        <button class="btn btn-sm btn-danger delete-product-btn" data-id="${productId}"><i class="bi bi-trash"></i> حذف المنتج</button>
                    </td>
                </tr>
            `;
        });

        // إذا لم تكن هناك تنبيهات
        if (!hasAlerts) {
            stockExpiryAlertsList.innerHTML = '<li class="list-group-item list-group-item-info">لا توجد تنبيهات حالياً.</li>';
        }

        // إضافة مستمعي الأحداث للأزرار التي تم إنشاؤها حديثاً (مهم جداً!)
        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', (e) => showEditProductForm(e.target.dataset.id || e.target.closest('button').dataset.id));
        });
        document.querySelectorAll('.add-batch-btn').forEach(button => {
            button.addEventListener('click', (e) => showAddBatchForm(e.target.dataset.id || e.target.closest('button').dataset.id, e.target.dataset.name || e.target.closest('button').dataset.name));
        });
        document.querySelectorAll('.view-batches-btn').forEach(button => {
            button.addEventListener('click', (e) => viewBatches(e.target.dataset.id || e.target.closest('button').dataset.id, e.target.dataset.name || e.target.closest('button').dataset.name));
        });
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteProduct(e.target.dataset.id || e.target.closest('button').dataset.id));
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        productsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">حدث خطأ في جلب المنتجات. تأكد من إعداد قواعد أمان Firestore بشكل صحيح.</td></tr>';
    }
}

function showAddProductForm() {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">إضافة منتج جديد</h2>
        <div class="card p-4 mx-auto" style="max-width: 500px;">
            <div class="mb-3">
                <label for="productName" class="form-label">الاسم:</label>
                <input type="text" class="form-control" id="productName" required>
            </div>
            <div class="mb-3">
                <label for="productBarcode" class="form-label">الباركود:</label>
                <input type="text" class="form-control" id="productBarcode">
                <button class="btn btn-sm btn-outline-secondary mt-1" id="scanBarcodeInputBtn"><i class="bi bi-qr-code-scan"></i> مسح الباركود</button>
            </div>
            <div id="barcode-scanner-input-container" style="width:100%; max-width:300px; display:none; margin: 5px auto;"></div>

            <div class="mb-3">
                <label for="productPrice" class="form-label">السعر (بيع):</label>
                <input type="number" class="form-control" id="productPrice" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="productPurchasePrice" class="form-label">سعر الشراء:</label>
                <input type="number" class="form-control" id="productPurchasePrice" step="0.01">
            </div>
            <div class="mb-3">
                <label for="productCategory" class="form-label">الفئة:</label>
                <input type="text" class="form-control" id="productCategory">
            </div>
            <div class="mb-3">
                <label for="productManufacturer" class="form-label">الشركة المصنعة:</label>
                <input type="text" class="form-control" id="productManufacturer">
            </div>
            <div class="mb-3">
                <label for="productMinStock" class="form-label">الحد الأدنى للمخزون:</label>
                <input type="number" class="form-control" id="productMinStock" value="5">
            </div>
            <button id="saveProductBtn" class="btn btn-success w-100">حفظ المنتج</button>
            <button id="cancelProductBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
            <div id="productFormError" class="alert alert-danger mt-3 d-none"></div>
        </div>
    `;

    document.getElementById('saveProductBtn').addEventListener('click', saveProduct);
    document.getElementById('cancelProductBtn').addEventListener('click', loadProductsContent);
    document.getElementById('scanBarcodeInputBtn').addEventListener('click', () => startBarcodeScannerForInput('productBarcode', 'barcode-scanner-input-container'));

}

// Global variable to hold specific scanner for input fields
let currentHtml5QrCodeScannerForInput = null;

function startBarcodeScannerForInput(targetInputId, scannerDivId) {
    const scannerContainer = document.getElementById(scannerDivId);
    scannerContainer.style.display = 'block';
    scannerContainer.innerHTML = `<div id="${scannerDivId}-reader" style="width: 100%;"></div><button class="btn btn-danger mt-2" id="stopScannerInputBtn">إيقاف الماسح</button>`;

    if (!currentHtml5QrCodeScannerForInput) {
        currentHtml5QrCodeScannerForInput = new Html5Qrcode(`${scannerDivId}-reader`);
    }

    currentHtml5QrCodeScannerForInput.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 }, // Fixed qrbox size for input
        (decodedText, decodedResult) => {
            document.getElementById(targetInputId).value = decodedText;
            stopBarcodeScannerForInput(scannerDivId); // Stop after scan
        },
        (errorMessage) => {
            // console.warn(`QR Code no longer in scan region. ${errorMessage}`);
        }
    )
    .catch((err) => {
        console.error(`Unable to start scanning for input: ${err}`);
        alert(`لا يمكن بدء الماسح الضوئي. تأكد من إعطاء إذن الكاميرا. الخطأ: ${err.message}`);
        stopBarcodeScannerForInput(scannerDivId);
    });

    document.getElementById('stopScannerInputBtn').addEventListener('click', () => stopBarcodeScannerForInput(scannerDivId));
}

function stopBarcodeScannerForInput(scannerDivId) {
    if (currentHtml5QrCodeScannerForInput && currentHtml5QrCodeScannerForInput.isScanning) {
        currentHtml5QrCodeScannerForInput.stop().then((ignore) => {
            console.log("Input Scanner stopped.");
            document.getElementById(scannerDivId).style.display = 'none';
            document.getElementById(scannerDivId).innerHTML = '';
        }).catch((err) => {
            console.error("Error stopping input scanner:", err);
        });
    } else {
        document.getElementById(scannerDivId).style.display = 'none';
        document.getElementById(scannerDivId).innerHTML = '';
    }
    currentHtml5QrCodeScannerForInput = null; // Reset for next use
}


async function saveProduct() {
    const productId = document.getElementById('productId') ? document.getElementById('productId').value : null; 
    const productName = document.getElementById('productName').value;
    const productBarcode = document.getElementById('productBarcode').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productPurchasePrice = parseFloat(document.getElementById('productPurchasePrice').value);
    const productCategory = document.getElementById('productCategory').value;
    const productManufacturer = document.getElementById('productManufacturer').value;
    const productMinStock = parseInt(document.getElementById('productMinStock').value);
    const productFormError = document.getElementById('productFormError');

    productFormError.classList.add('d-none');

    if (!productName || isNaN(productPrice) || productPrice <= 0) {
        productFormError.textContent = "الاسم والسعر مطلوبان والسعر يجب أن يكون أكبر من صفر.";
        productFormError.classList.remove('d-none');
        return;
    }

    const productData = {
        name: productName,
        barcode: productBarcode || null,
        price: productPrice,
        purchasePrice: isNaN(productPurchasePrice) ? null : productPurchasePrice,
        category: productCategory || null,
        manufacturer: productManufacturer || null,
        minStockLevel: isNaN(productMinStock) ? 5 : productMinStock,
        createdAt: productId ? undefined : new Date().toISOString()
    };

    try {
        if (productId) {
            const productDocRef = doc(db, "products", productId);
            await updateDoc(productDocRef, productData);
            alert('تم تحديث المنتج بنجاح!');
        } else {
            await addDoc(collection(db, "products"), productData);
            alert('تم إضافة المنتج بنجاح!');
        }
        loadProductsContent();
    } catch (error) {
        console.error("Error saving product:", error);
        productFormError.textContent = `خطأ في حفظ المنتج: ${error.message}`;
        productFormError.classList.remove('d-none');
    }
}

async function showEditProductForm(productId) {
    try {
        const productDocRef = doc(db, "products", productId);
        const productDoc = await getDoc(productDocRef);

        if (!productDoc.exists()) {
            alert('المنتج غير موجود!');
            loadProductsContent();
            return;
        }

        const product = productDoc.data();
        contentArea.innerHTML = `
            <h2 class="text-center mb-4">تعديل منتج</h2>
            <div class="card p-4 mx-auto" style="max-width: 500px;">
                <input type="hidden" id="productId" value="${productId}">
                <div class="mb-3">
                    <label for="productName" class="form-label">الاسم:</label>
                    <input type="text" class="form-control" id="productName" value="${product.name}" required>
                </div>
                <div class="mb-3">
                    <label for="productBarcode" class="form-label">الباركود:</label>
                    <input type="text" class="form-control" id="productBarcode" value="${product.barcode || ''}">
                    <button class="btn btn-sm btn-outline-secondary mt-1" id="scanBarcodeInputBtn"><i class="bi bi-qr-code-scan"></i> مسح الباركود</button>
                </div>
                <div id="barcode-scanner-input-container" style="width:100%; max-width:300px; display:none; margin: 5px auto;"></div>

                <div class="mb-3">
                    <label for="productPrice" class="form-label">السعر (بيع):</label>
                    <input type="number" class="form-control" id="productPrice" step="0.01" value="${product.price}" required>
                </div>
                <div class="mb-3">
                    <label for="productPurchasePrice" class="form-label">سعر الشراء:</label>
                    <input type="number" class="form-control" id="productPurchasePrice" step="0.01" value="${product.purchasePrice || ''}">
                </div>
                <div class="mb-3">
                    <label for="productCategory" class="form-label">الفئة:</label>
                    <input type="text" class="form-control" id="productCategory" value="${product.category || ''}">
                </div>
                <div class="mb-3">
                    <label for="productManufacturer" class="form-label">الشركة المصنعة:</label>
                    <input type="text" class="form-control" id="productManufacturer" value="${product.manufacturer || ''}">
                </div>
                <div class="mb-3">
                    <label for="productMinStock" class="form-label">الحد الأدنى للمخزون:</label>
                    <input type="number" class="form-control" id="productMinStock" value="${product.minStockLevel || 5}">
                </div>
                <button id="saveProductBtn" class="btn btn-success w-100">تحديث المنتج</button>
                <button id="cancelProductBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
                <div id="productFormError" class="alert alert-danger mt-3 d-none"></div>
            </div>
        `;

        document.getElementById('saveProductBtn').addEventListener('click', saveProduct);
        document.getElementById('cancelProductBtn').addEventListener('click', loadProductsContent);
        document.getElementById('scanBarcodeInputBtn').addEventListener('click', () => startBarcodeScannerForInput('productBarcode', 'barcode-scanner-input-container'));

    } catch (error) {
        console.error("Error loading product for edit:", error);
        alert(`خطأ في تحميل بيانات المنتج: ${error.message}`);
        loadProductsContent();
    }
}

async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟ سيتم حذف جميع دفعاته المرتبطة به.')) {
        return;
    }
    try {
        const batchesRef = collection(db, `products/${productId}/batches`);
        const batchesSnapshot = await getDocs(batchesRef);
        const deleteBatchPromises = [];
        batchesSnapshot.forEach(batchDoc => {
            deleteBatchPromises.push(deleteDoc(doc(db, `products/${productId}/batches`, batchDoc.id)));
        });
        await Promise.all(deleteBatchPromises);

        await deleteDoc(doc(db, "products", productId));
        alert('تم حذف المنتج بنجاح!');
        loadProductsContent();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert(`خطأ في حذف المنتج: ${error.message}`);
    }
}


// --- 4. Batch Management (إدارة الدفعات - كمجموعة فرعية) ---
function showAddBatchForm(productId, productName) {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">إضافة دفعة لـ "${productName}"</h2>
        <div class="card p-4 mx-auto" style="max-width: 500px;">
            <input type="hidden" id="batchProductId" value="${productId}">
            <div class="mb-3">
                <label for="batchNumber" class="form-label">رقم الدفعة:</label>
                <input type="text" class="form-control" id="batchNumber" required>
            </div>
            <div class="mb-3">
                <label for="expiryDate" class="form-label">تاريخ انتهاء الصلاحية:</label>
                <input type="date" class="form-control" id="expiryDate" required>
            </div>
            <div class="mb-3">
                <label for="batchQuantity" class="form-label">الكمية:</label>
                <input type="number" class="form-control" id="batchQuantity" required>
            </div>
            <div class="mb-3">
                <label for="purchaseDate" class="form-label">تاريخ الشراء:</label>
                <input type="date" class="form-control" id="purchaseDate" value="${new Date().toISOString().slice(0,10)}" required>
            </div>
            <button id="saveBatchBtn" class="btn btn-success w-100">حفظ الدفعة</button>
            <button id="cancelBatchBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
            <div id="batchFormError" class="alert alert-danger mt-3 d-none"></div>
        </div>
    `;

    document.getElementById('saveBatchBtn').addEventListener('click', saveBatch);
    document.getElementById('cancelBatchBtn').addEventListener('click', loadProductsContent);
}

async function saveBatch() {
    const productId = document.getElementById('batchProductId').value;
    const batchNumber = document.getElementById('batchNumber').value;
    const expiryDate = document.getElementById('expiryDate').value; 
    const quantity = parseInt(document.getElementById('batchQuantity').value);
    const purchaseDate = document.getElementById('purchaseDate').value;
    const batchFormError = document.getElementById('batchFormError');

    batchFormError.classList.add('d-none');

    if (!batchNumber || !expiryDate || isNaN(quantity) || !purchaseDate || quantity <= 0) {
        batchFormError.textContent = "جميع الحقول مطلوبة والكمية يجب أن تكون أكبر من صفر.";
        batchFormError.classList.remove('d-none');
        return;
    }

    try {
        const batchesCollectionRef = collection(db, `products/${productId}/batches`);
        await addDoc(batchesCollectionRef, {
            batchNumber: batchNumber,
            expiryDate: expiryDate,
            quantity: quantity,
            purchaseDate: purchaseDate,
            createdAt: new Date().toISOString()
        });
        alert('تم إضافة الدفعة بنجاح!');
        loadProductsContent();
    } catch (error) {
        console.error("Error adding batch:", error);
        batchFormError.textContent = `خطأ في إضافة الدفعة: ${error.message}`;
        batchFormError.classList.remove('d-none');
    }
}

// ** بداية محتوى صفحة "عرض الدفعات" **
async function viewBatches(productId, productName) {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">الدفعات لـ "${productName}"</h2>
        <button class="btn btn-primary mb-3" id="addBatchFromViewBtn" data-id="${productId}" data-name="${productName}"><i class="bi bi-plus-lg"></i> إضافة دفعة جديدة</button>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>رقم الدفعة</th>
                        <th>تاريخ الانتهاء</th>
                        <th>الكمية</th>
                        <th>تاريخ الشراء</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="batchesTableBody">
                    <tr><td colspan="5" class="text-center">جارٍ تحميل الدفعات...</td></tr>
                </tbody>
            </table>
        </div>
        <button class="btn btn-secondary mt-3" id="backToProductsBtn">العودة لقائمة المنتجات</button>
    `;

    document.getElementById('addBatchFromViewBtn').addEventListener('click', (e) => showAddBatchForm
