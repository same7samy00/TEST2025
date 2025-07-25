// js/main.js

// Import Firebase services from the initialization file
import { db, auth } from "./firebase-init.js";
// Import specific functions from Firebase SDKs that you'll use
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

// --- Global POS Cart Variable ---
let posCart = []; // The current cart for the Point of Sale system

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
        <p>مرحباً بك في لوحة تحكم نظام محل العطارة. اختر خياراً من القائمة أعلاه.</p>
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
                        <th>الوحدة</th>
                        <th>السعر</th>
                        <th>الكمية المتوفرة</th>
                        <th>المورد</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="productsTableBody">
                    <tr><td colspan="7" class="text-center">جارٍ تحميل المنتجات...</td></tr>
                </tbody>
            </table>
        </div>
        <div id="productAlerts" class="mt-4">
            <h4><i class="bi bi-exclamation-triangle-fill text-warning"></i> تنبيهات المخزون</h4>
            <ul id="stockAlerts" class="list-group">
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
    document.getElementById('scanBarcodeBtn').addEventListener('click', startBarcodeScanner);

    await fetchProducts(); // Fetch all products initially
}

// Global variable for scanner (used for product search)
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

// CORRECTED FUNCTION
function stopBarcodeScanner() {
    if (html5QrCodeScanner && html5QrCodeScanner.isScanning) { // Corrected: html5QrCodeScanner.isScanning is a boolean property
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
    // No need to set html5QrCodeScanner = null here if it's reused for search
}


async function fetchProducts(searchTerm = '') {
    const productsTableBody = document.getElementById('productsTableBody');
    productsTableBody.innerHTML = ''; // مسح المحتوى السابق
    const stockAlertsList = document.getElementById('stockAlerts');
    stockAlertsList.innerHTML = ''; // مسح التنبيهات السابقة

    let productsRef = collection(db, "products");
    let q;

    if (searchTerm) {
        const isBarcodeSearch = /^\d+$/.test(searchTerm) && searchTerm.length >= 8; // Heuristic for barcode
        if (isBarcodeSearch) {
            q = query(productsRef, where("barcode", "==", searchTerm));
        } else {
            q = query(productsRef, orderBy("name"), where("name", ">=", searchTerm), where("name", "<=", searchTerm + '\uf8ff'));
        }

    } else {
        q = query(productsRef, orderBy("name", "asc"));
    }

    try {
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا يوجد منتجات مطابقة أو مسجلة.</td></tr>';
            stockAlertsList.innerHTML = '<li class="list-group-item list-group-item-info">لا توجد تنبيهات حالياً.</li>';
            return;
        }

        let hasAlerts = false;
        
        for (const productDoc of snapshot.docs) { // Use for...of for async inside loop
            const product = productDoc.data();
            const productId = productDoc.id;

            let totalQuantity = 0;
            const batchesRef = collection(db, `products/${productId}/batches`);
            const batchesSnapshot = await getDocs(batchesRef);
            
            batchesSnapshot.forEach(batchDoc => {
                const batch = batchDoc.data();
                totalQuantity += batch.quantity || 0;
            });
            
            // تنبيهات الكمية المنخفضة
            if (totalQuantity <= (product.minStockLevel || 5)) { // Use a default minStockLevel if not set
                stockAlertsList.innerHTML += `<li class="list-group-item list-group-item-danger">المنتج ${product.name} - الكمية الكلية (${totalQuantity} ${product.unit || ''}) أقل من أو تساوي الحد الأدنى (${product.minStockLevel || 5} ${product.unit || ''}).</li>`;
                hasAlerts = true;
            }


            productsTableBody.innerHTML += `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.barcode || 'N/A'}</td>
                    <td>${product.unit || 'N/A'}</td>
                    <td>${product.price}</td>
                    <td>${totalQuantity} ${product.unit || ''}</td>
                    <td>${product.supplier || 'غير محدد'}</td>
                    <td>
                        <button class="btn btn-sm btn-info edit-product-btn" data-id="${productId}"><i class="bi bi-pencil-square"></i> تعديل</button>
                        <button class="btn btn-sm btn-warning add-batch-btn" data-id="${productId}" data-name="${product.name}"><i class="bi bi-box-fill"></i> إضافة كمية</button>
                        <button class="btn btn-sm btn-primary view-batches-btn" data-id="${productId}" data-name="${product.name}"><i class="bi bi-eye"></i> عرض الكميات</button>
                        <button class="btn btn-sm btn-danger delete-product-btn" data-id="${productId}"><i class="bi bi-trash"></i> حذف</button>
                    </td>
                </tr>
            `;
        } // End of for...of loop

        // إذا لم تكن هناك تنبيهات
        if (!hasAlerts) {
            stockAlertsList.innerHTML = '<li class="list-group-item list-group-item-info">لا توجد تنبيهات حالياً.</li>';
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
        productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">حدث خطأ في جلب المنتجات. تأكد من إعداد قواعد أمان Firestore بشكل صحيح.</td></tr>';
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
                <label for="productUnit" class="form-label">الوحدة الأساسية (مثال: Kg, g, Pc, Bottle):</label>
                <input type="text" class="form-control" id="productUnit" required placeholder="مثال: Kg">
            </div>
            <div class="mb-3">
                <label for="productPrice" class="form-label">السعر (لكل وحدة):</label>
                <input type="number" class="form-control" id="productPrice" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="productPurchasePrice" class="form-label">سعر الشراء (لكل وحدة):</label>
                <input type="number" class="form-control" id="productPurchasePrice" step="0.01">
            </div>
            <div class="mb-3">
                <label for="productCategory" class="form-label">الفئة:</label>
                <input type="text" class="form-control" id="productCategory">
            </div>
            <div class="mb-3">
                <label for="productSupplier" class="form-label">المورد:</label>
                <input type="text" class="form-control" id="productSupplier">
            </div>
            <div class="mb-3">
                <label for="productMinStock" class="form-label">الحد الأدنى للمخزون (بالوحدة):</label>
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
    const productUnit = document.getElementById('productUnit').value; // NEW: Unit
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productPurchasePrice = parseFloat(document.getElementById('productPurchasePrice').value);
    const productCategory = document.getElementById('productCategory').value;
    const productSupplier = document.getElementById('productSupplier').value; // NEW: Supplier
    const productMinStock = parseInt(document.getElementById('productMinStock').value);
    const productFormError = document.getElementById('productFormError');

    productFormError.classList.add('d-none');

    if (!productName || !productUnit || isNaN(productPrice) || productPrice <= 0) {
        productFormError.textContent = "الاسم، الوحدة الأساسية، والسعر مطلوبون والسعر يجب أن يكون أكبر من صفر.";
        productFormError.classList.remove('d-none');
        return;
    }

    const productData = {
        name: productName,
        barcode: productBarcode || null,
        unit: productUnit, // Save unit
        price: productPrice,
        purchasePrice: isNaN(productPurchasePrice) ? null : productPurchasePrice,
        category: productCategory || null,
        supplier: productSupplier || null, // Save supplier
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
                    <label for="productUnit" class="form-label">الوحدة الأساسية (مثال: Kg, g, Pc, Bottle):</label>
                    <input type="text" class="form-control" id="productUnit" value="${product.unit || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="productPrice" class="form-label">السعر (لكل وحدة):</label>
                    <input type="number" class="form-control" id="productPrice" step="0.01" value="${product.price}" required>
                </div>
                <div class="mb-3">
                    <label for="productPurchasePrice" class="form-label">سعر الشراء (لكل وحدة):</label>
                    <input type="number" class="form-control" id="productPurchasePrice" step="0.01" value="${product.purchasePrice || ''}">
                </div>
                <div class="mb-3">
                    <label for="productCategory" class="form-label">الفئة:</label>
                    <input type="text" class="form-control" id="productCategory" value="${product.category || ''}">
                </div>
                <div class="mb-3">
                    <label for="productSupplier" class="form-label">المورد:</label>
                    <input type="text" class="form-control" id="productSupplier" value="${product.supplier || ''}">
                </div>
                <div class="mb-3">
                    <label for="productMinStock" class="form-label">الحد الأدنى للمخزون (بالوحدة):</label>
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
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟ سيتم حذف جميع كمياته المرتبطة به.')) {
        return;
    }
    try {
        // Delete all sub-collections (batches/quantities) first
        const batchesRef = collection(db, `products/${productId}/batches`);
        const batchesSnapshot = await getDocs(batchesRef);
        const deleteBatchPromises = [];
        batchesSnapshot.forEach(batchDoc => {
            deleteBatchPromises.push(deleteDoc(doc(db, `products/${productId}/batches`, batchDoc.id)));
        });
        await Promise.all(deleteBatchPromises);

        // Then delete the product document itself
        await deleteDoc(doc(db, "products", productId));
        alert('تم حذف المنتج بنجاح!');
        loadProductsContent();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert(`خطأ في حذف المنتج: ${error.message}`);
    }
}


// --- 4. Batch Management (إدارة الكميات المضافة للمنتج) ---
function showAddBatchForm(productId, productName) {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">إضافة كمية لـ "${productName}"</h2>
        <div class="card p-4 mx-auto" style="max-width: 500px;">
            <input type="hidden" id="batchProductId" value="${productId}">
            <div class="mb-3">
                <label for="batchQuantity" class="form-label">الكمية المضافة:</label>
                <input type="number" class="form-control" id="batchQuantity" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="purchaseDate" class="form-label">تاريخ الإضافة/الشراء:</label>
                <input type="date" class="form-control" id="purchaseDate" value="${new Date().toISOString().slice(0,10)}" required>
            </div>
            <div class="mb-3">
                <label for="notes" class="form-label">ملاحظات (اختياري):</label>
                <textarea class="form-control" id="batchNotes" rows="3"></textarea>
            </div>
            <button id="saveBatchBtn" class="btn btn-success w-100">حفظ الكمية</button>
            <button id="cancelBatchBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
            <div id="batchFormError" class="alert alert-danger mt-3 d-none"></div>
        </div>
    `;

    document.getElementById('saveBatchBtn').addEventListener('click', saveBatch);
    document.getElementById('cancelBatchBtn').addEventListener('click', loadProductsContent);
}

async function saveBatch() {
    const productId = document.getElementById('batchProductId').value;
    const quantity = parseFloat(document.getElementById('batchQuantity').value);
    const purchaseDate = document.getElementById('purchaseDate').value;
    const notes = document.getElementById('batchNotes').value;
    const batchFormError = document.getElementById('batchFormError');

    batchFormError.classList.add('d-none');

    if (isNaN(quantity) || quantity <= 0 || !purchaseDate) {
        batchFormError.textContent = "الكمية المضافة وتاريخ الإضافة مطلوبان والكمية يجب أن تكون أكبر من صفر.";
        batchFormError.classList.remove('d-none');
        return;
    }

    try {
        const batchesCollectionRef = collection(db, `products/${productId}/batches`);
        await addDoc(batchesCollectionRef, {
            quantity: quantity,
            purchaseDate: purchaseDate,
            notes: notes || null,
            createdAt: new Date().toISOString()
        });
        alert('تم إضافة الكمية بنجاح!');
        loadProductsContent();
    } catch (error) {
        console.error("Error adding batch (quantity):", error);
        batchFormError.textContent = `خطأ في إضافة الكمية: ${error.message}`;
        batchFormError.classList.remove('d-none');
    }
}


async function viewBatches(productId, productName) {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">الكميات المضافة لـ "${productName}"</h2>
        <button class="btn btn-primary mb-3" id="addBatchFromViewBtn" data-id="${productId}" data-name="${productName}"><i class="bi bi-plus-lg"></i> إضافة كمية جديدة</button>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>الكمية المضافة</th>
                        <th>تاريخ الإضافة</th>
                        <th>ملاحظات</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="batchesTableBody">
                    <tr><td colspan="4" class="text-center">جارٍ تحميل الكميات...</td></tr>
                </tbody>
            </table>
        </div>
        <button class="btn btn-secondary mt-3" id="backToProductsBtn">العودة لقائمة المنتجات</button>
    `;

    document.getElementById('addBatchFromViewBtn').addEventListener('click', (e) => showAddBatchForm(e.target.dataset.id || e.target.closest('button').dataset.id, e.target.dataset.name || e.target.closest('button').dataset.name));
    document.getElementById('backToProductsBtn').addEventListener('click', loadProductsContent);

    const batchesTableBody = document.getElementById('batchesTableBody');
    batchesTableBody.innerHTML = '';

    try {
        const batchesRef = collection(db, `products/${productId}/batches`);
        const q = query(batchesRef, orderBy("createdAt", "desc")); // ترتيب الكميات حسب تاريخ الإضافة
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            batchesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد كميات مضافة لهذا المنتج.</td></tr>';
            return;
        }

        for (const batchDoc of snapshot.docs) { // Use for...of for async inside loop
            const batch = batchDoc.data();
            const batchId = batchDoc.id;

            batchesTableBody.innerHTML += `
                <tr>
                    <td>${batch.quantity}</td>
                    <td>${batch.purchaseDate}</td>
                    <td>${batch.notes || 'لا يوجد'}</td>
                    <td>
                        <button class="btn btn-sm btn-info edit-batch-item-btn" data-product-id="${productId}" data-batch-id="${batchId}" data-product-name="${productName}"><i class="bi bi-pencil-square"></i> تعديل</button>
                        <button class="btn btn-sm btn-danger delete-batch-item-btn" data-product-id="${productId}" data-batch-id="${batchId}" data-product-name="${productName}"><i class="bi bi-trash"></i> حذف</button>
                    </td>
                </tr>
            `;
        }

        document.querySelectorAll('.edit-batch-item-btn').forEach(button => {
            button.addEventListener('click', (e) => showEditBatchItemForm(e.target.dataset.productId || e.target.closest('button').dataset.productId, e.target.dataset.batchId || e.target.closest('button').dataset.batchId, e.target.dataset.productName || e.target.closest('button').dataset.productName));
        });
        document.querySelectorAll('.delete-batch-item-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteBatchItem(e.target.dataset.productId || e.target.closest('button').dataset.productId, e.target.dataset.batchId || e.target.closest('button').dataset.batchId, e.target.dataset.productName || e.target.closest('button').dataset.productName));
        });

    } catch (error) {
        console.error("Error fetching batches (quantities):", error);
        batchesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">حدث خطأ في جلب الكميات.</td></tr>';
    }
}

async function showEditBatchItemForm(productId, batchId, productName) {
    try {
        const batchDocRef = doc(db, `products/${productId}/batches`, batchId);
        const batchDoc = await getDoc(batchDocRef);

        if (!batchDoc.exists()) {
            alert('الكمية غير موجودة!');
            viewBatches(productId, productName);
            return;
        }

        const batch = batchDoc.data();
        contentArea.innerHTML = `
            <h2 class="text-center mb-4">تعديل كمية لـ "${productName}"</h2>
            <div class="card p-4 mx-auto" style="max-width: 500px;">
                <input type="hidden" id="editBatchProductId" value="${productId}">
                <input type="hidden" id="editBatchId" value="${batchId}">
                <div class="mb-3">
                    <label for="editBatchQuantity" class="form-label">الكمية:</label>
                    <input type="number" class="form-control" id="editBatchQuantity" step="0.01" value="${batch.quantity}" required>
                </div>
                <div class="mb-3">
                    <label for="editPurchaseDate" class="form-label">تاريخ الإضافة/الشراء:</label>
                    <input type="date" class="form-control" id="editPurchaseDate" value="${batch.purchaseDate}" required>
                </div>
                <div class="mb-3">
                    <label for="editBatchNotes" class="form-label">ملاحظات (اختياري):</label>
                    <textarea class="form-control" id="editBatchNotes" rows="3">${batch.notes || ''}</textarea>
                </div>
                <button id="updateBatchBtn" class="btn btn-success w-100">تحديث الكمية</button>
                <button id="cancelEditBatchBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
                <div id="editBatchFormError" class="alert alert-danger mt-3 d-none"></div>
            </div>
        `;

        document.getElementById('updateBatchBtn').addEventListener('click', () => updateBatchItem(productId, batchId, productName));
        document.getElementById('cancelEditBatchBtn').addEventListener('click', () => viewBatches(productId, productName));

    } catch (error) {
        console.error("Error loading batch item for edit:", error);
        alert(`خطأ في تحميل بيانات الكمية: ${error.message}`);
        viewBatches(productId, productName);
    }
}

async function updateBatchItem(productId, batchId, productName) {
    const quantity = parseFloat(document.getElementById('editBatchQuantity').value);
    const purchaseDate = document.getElementById('editPurchaseDate').value;
    const notes = document.getElementById('editBatchNotes').value;
    const editBatchFormError = document.getElementById('editBatchFormError');

    editBatchFormError.classList.add('d-none');

    if (isNaN(quantity) || quantity <= 0 || !purchaseDate) {
        editBatchFormError.textContent = "الكمية وتاريخ الإضافة مطلوبان والكمية يجب أن تكون أكبر من صفر.";
        editBatchFormError.classList.remove('d-none');
        return;
    }

    try {
        const batchDocRef = doc(db, `products/${productId}/batches`, batchId);
        await updateDoc(batchDocRef, {
            quantity: quantity,
            purchaseDate: purchaseDate,
            notes: notes || null
        });
        alert('تم تحديث الكمية بنجاح!');
        viewBatches(productId, productName);
    } catch (error) {
        console.error("Error updating batch item:", error);
        editBatchFormError.textContent = `خطأ في تحديث الكمية: ${error.message}`;
        editBatchFormError.classList.remove('d-none');
    }
}

async function deleteBatchItem(productId, batchId, productName) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذه الكمية؟')) {
        return;
    }
    try {
        await deleteDoc(doc(db, `products/${productId}/batches`, batchId));
        alert('تم حذف الكمية بنجاح!');
        viewBatches(productId, productName); // العودة إلى عرض الكميات بعد الحذف
    } catch (error) {
        console.error("Error deleting batch item:", error);
        alert(`خطأ في حذف الكمية: ${error.message}`);
    }
}


// --- 5. Sales Management (إدارة المبيعات - نقطة البيع POS) ---
salesLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) {
        loadSalesContent();
    } else {
        alert('يرجى تسجيل الدخول لعرض المبيعات.');
        showLoginForm();
    }
});

// Global POS Cart variable
let posCart = []; 
let selectedCustomerId = null;
let selectedCustomerName = '';

// Function to load the POS content
async function loadSalesContent() {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">نقطة البيع (POS)</h2>
        <div class="row">
            <div class="col-md-7">
                <div class="card p-3 mb-3">
                    <h4><i class="bi bi-search"></i> إضافة منتج للبيع</h4>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" id="posProductSearchInput" placeholder="ابحث بالاسم أو الباركود">
                        <button class="btn btn-outline-secondary" type="button" id="posProductSearchBtn"><i class="bi bi-search"></i></button>
                        <button class="btn btn-info" type="button" id="posScanBarcodeBtn"><i class="bi bi-qr-code-scan"></i> مسح باركود</button>
                    </div>
                    <div id="pos-scanner-container" style="width:100%; max-width:300px; display:none; margin: 5px auto;"></div>
                    <div id="posSearchResults" class="list-group"></div>
                </div>

                <div class="card p-3">
                    <h4><i class="bi bi-cart"></i> سلة المشتريات</h4>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>السعر/الوحدة</th>
                                    <th>الإجمالي</th>
                                    <th>إجراء</th>
                                </tr>
                            </thead>
                            <tbody id="posCartTableBody">
                                </tbody>
                        </table>
                    </div>
                    <h4 class="text-end mt-3">الإجمالي الكلي: <span id="posGrandTotal">0.00</span></h4>
                </div>
            </div>

            <div class="col-md-5">
                <div class="card p-3 mb-3">
                    <h4><i class="bi bi-people"></i> العميل (للبيع الآجل)</h4>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" id="customerSearchInput" placeholder="ابحث برقم الهاتف أو الاسم">
                        <button class="btn btn-outline-secondary" type="button" id="customerSearchBtn"><i class="bi bi-search"></i></button>
                        <button class="btn btn-info" type="button" id="scanCustomerQRBtn"><i class="bi bi-qr-code-scan"></i> مسح QR</button>
                    </div>
                    <div id="customer-scanner-container" style="width:100%; max-width:250px; display:none; margin: 5px auto;"></div>
                    <div id="customerSearchResults" class="list-group mb-3"></div>
                    <div id="selectedCustomerDisplay" class="alert alert-success d-none">
                        العميل المحدد: <span id="selectedCustomerName"></span> (<span id="selectedCustomerPhone"></span>)
                        <button class="btn btn-sm btn-danger float-end" id="clearCustomerBtn">X</button>
                    </div>
                    <button class="btn btn-sm btn-primary mt-2" id="addNewCustomerBtn"><i class="bi bi-person-plus"></i> إضافة عميل جديد</button>
                </div>

                <div class="card p-3">
                    <h4><i class="bi bi-cash"></i> إتمام عملية البيع</h4>
                    <div class="mb-3">
                        <label for="paymentMethod" class="form-label">طريقة الدفع:</label>
                        <select class="form-select" id="paymentMethod">
                            <option value="cash">نقدي</option>
                            <option value="credit" disabled>آجل</option> </select>
                    </div>
                    <div class="mb-3">
                        <label for="amountPaid" class="form-label">المبلغ المدفوع:</label>
                        <input type="number" class="form-control" id="amountPaid" step="0.01">
                    </div>
                    <button class="btn btn-success w-100 mb-2" id="completeSaleBtn"><i class="bi bi-check-lg"></i> إتمام البيع</button>
                    <button class="btn btn-danger w-100" id="cancelSaleBtn"><i class="bi bi-x-lg"></i> إلغاء البيع</button>
                </div>
            </div>
        </div>
    `;

    // Initialize event listeners for POS
    posCart = []; // Clear cart on load
    selectedCustomerId = null;
    selectedCustomerName = '';
    updatePosCartDisplay(); // Render empty cart

    document.getElementById('posProductSearchBtn').addEventListener('click', () => searchProductsForPos(document.getElementById('posProductSearchInput').value));
    document.getElementById('posProductSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProductsForPos(document.getElementById('posProductSearchInput').value);
        }
    });
    document.getElementById('posScanBarcodeBtn').addEventListener('click', () => startBarcodeScannerForPos('posProductSearchInput', 'pos-scanner-container'));

    document.getElementById('customerSearchBtn').addEventListener('click', () => searchCustomersForPos(document.getElementById('customerSearchInput').value));
    document.getElementById('customerSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCustomersForPos(document.getElementById('customerSearchInput').value);
        }
    });
    document.getElementById('scanCustomerQRBtn').addEventListener('click', () => startBarcodeScannerForCustomer('customerSearchInput', 'customer-scanner-container'));
    document.getElementById('clearCustomerBtn').addEventListener('click', clearSelectedCustomer);
    document.getElementById('addNewCustomerBtn').addEventListener('click', showAddCustomerForm); // Link to add customer page

    document.getElementById('paymentMethod').addEventListener('change', updatePaymentAmountField);
    document.getElementById('completeSaleBtn').addEventListener('click', completeSale);
    document.getElementById('cancelSaleBtn').addEventListener('click', loadSalesContent); // Reload POS page

    // Update amount paid field when payment method changes or total changes
    document.getElementById('amountPaid').value = getTotalCartAmount().toFixed(2);
}

// Global variable for POS scanner
let posHtml5QrCodeScanner = null;

function startBarcodeScannerForPos(targetInputId, scannerDivId) {
    const scannerContainer = document.getElementById(scannerDivId);
    scannerContainer.style.display = 'block';
    scannerContainer.innerHTML = `<div id="${scannerDivId}-reader" style="width: 100%;"></div><button class="btn btn-danger mt-2" id="stopPosScannerBtn">إيقاف الماسح</button>`;

    if (!posHtml5QrCodeScanner) {
        posHtml5QrCodeScanner = new Html5Qrcode(`${scannerDivId}-reader`);
    }

    posHtml5QrCodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText, decodedResult) => {
            console.log(`POS Scan result: ${decodedText}`, decodedResult);
            document.getElementById(targetInputId).value = decodedText;
            stopBarcodeScannerForPos(scannerDivId);
            await searchProductsForPos(decodedText, true); // Search and add directly if exact match
        },
        (errorMessage) => {}
    )
    .catch((err) => {
        console.error(`Unable to start POS scanning: ${err}`);
        alert(`لا يمكن بدء ماسح نقطة البيع. تأكد من إعطاء إذن الكاميرا. الخطأ: ${err.message}`);
        stopBarcodeScannerForPos(scannerDivId);
    });

    document.getElementById('stopPosScannerBtn').addEventListener('click', () => stopBarcodeScannerForPos(scannerDivId));
}

function stopBarcodeScannerForPos(scannerDivId) {
    if (posHtml5QrCodeScanner && posHtml5QrCodeScanner.isScanning) {
        posHtml5QrCodeScanner.stop().then(() => {
            console.log("POS Scanner stopped.");
            document.getElementById(scannerDivId).style.display = 'none';
            document.getElementById(scannerDivId).innerHTML = '';
        }).catch((err) => {
            console.error("Error stopping POS scanner:", err);
        });
    } else {
        document.getElementById(scannerDivId).style.display = 'none';
        document.getElementById(scannerDivId).innerHTML = '';
    }
    // Do NOT set posHtml5QrCodeScanner = null here if it's potentially reused.
    // For single-use scanners per page load, setting to null is fine.
    // If it's used multiple times within a single POS session, manage its state.
}


async function searchProductsForPos(searchTerm, autoAddToCart = false) {
    const posSearchResults = document.getElementById('posSearchResults');
    posSearchResults.innerHTML = ''; // Clear previous results

    let productsRef = collection(db, "products");
    let q;

    const isBarcodeSearch = /^\d+$/.test(searchTerm) && searchTerm.length >= 8;
    if (isBarcodeSearch) {
        q = query(productsRef, where("barcode", "==", searchTerm));
    } else {
        q = query(productsRef, orderBy("name"), where("name", ">=", searchTerm), where("name", "<=", searchTerm + '\uf8ff'));
    }

    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            posSearchResults.innerHTML = '<div class="list-group-item">لا يوجد منتجات مطابقة.</div>';
            return;
        }

        if (autoAddToCart && snapshot.docs.length === 1) {
            const productDoc = snapshot.docs[0];
            const product = productDoc.data();
            const productId = productDoc.id;
            // Directly add to cart if only one exact match (for barcode scan)
            addProductToCart(productId, product.name, product.price, product.unit, 1); // Default quantity 1
            return;
        }

        snapshot.forEach(productDoc => {
            const product = productDoc.data();
            const productId = productDoc.id;
            posSearchResults.innerHTML += `
                <button type="button" class="list-group-item list-group-item-action product-select-btn"
                        data-id="${productId}" data-name="${product.name}" data-price="${product.price}" data-unit="${product.unit}">
                    ${product.name} (${product.barcode || 'لا باركود'}) - ${product.price} لكل ${product.unit || 'وحدة'}
                </button>
            `;
        });

        document.querySelectorAll('.product-select-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const name = e.target.dataset.name;
                const price = parseFloat(e.target.dataset.price);
                const unit = e.target.dataset.unit;
                addProductToCart(id, name, price, unit, 1); // Add with default quantity 1
                posSearchResults.innerHTML = ''; // Clear results after selection
                document.getElementById('posProductSearchInput').value = ''; // Clear search input
            });
        });

    } catch (error) {
        console.error("Error searching products for POS:", error);
        posSearchResults.innerHTML = '<div class="list-group-item text-danger">خطأ في البحث عن المنتجات.</div>';
    }
}

function addProductToCart(productId, name, price, unit, quantity) {
    const existingItemIndex = posCart.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
        posCart[existingItemIndex].quantity += quantity;
    } else {
        posCart.push({
            productId: productId,
            name: name,
            price: price,
            unit: unit,
            quantity: quantity
        });
    }
    updatePosCartDisplay();
}

function removeProductFromCart(productId) {
    posCart = posCart.filter(item => item.productId !== productId);
    updatePosCartDisplay();
}

function updatePosCartItemQuantity(productId, newQuantity) {
    const item = posCart.find(item => item.productId === productId);
    if (item) {
        item.quantity = Math.max(0, newQuantity); // Quantity cannot be negative
        if (item.quantity === 0) {
            removeProductFromCart(productId);
        } else {
            updatePosCartDisplay();
        }
    }
}

function getTotalCartAmount() {
    return posCart.reduce((total, item) => total + (item.quantity * item.price), 0);
}

function updatePosCartDisplay() {
    const posCartTableBody = document.getElementById('posCartTableBody');
    posCartTableBody.innerHTML = '';
    let grandTotal = 0;

    if (posCart.length === 0) {
        posCartTableBody.innerHTML = '<tr><td colspan="5" class="text-center">السلة فارغة.</td></tr>';
        document.getElementById('posGrandTotal').textContent = '0.00';
        document.getElementById('amountPaid').value = '0.00';
        document.getElementById('paymentMethod').value = 'cash'; // Reset payment method
        document.getElementById('paymentMethod').querySelector('option[value="credit"]').disabled = true;
        selectedCustomerId = null; // Clear selected customer if cart is empty
        selectedCustomerName = '';
        document.getElementById('selectedCustomerDisplay').classList.add('d-none');
        return;
    }

    posCart.forEach(item => {
        const itemTotal = item.quantity * item.price;
        grandTotal += itemTotal;
        posCartTableBody.innerHTML += `
            <tr>
                <td>${item.name} (${item.unit})</td>
                <td>
                    <input type="number" class="form-control form-control-sm cart-qty-input" 
                           data-id="${item.productId}" value="${item.quantity}" step="0.01" style="width: 80px; display: inline-block;">
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-from-cart-btn" data-id="${item.productId}"><i class="bi bi-x-lg"></i></button>
                </td>
            </tr>
        `;
    });

    document.getElementById('posGrandTotal').textContent = grandTotal.toFixed(2);
    document.getElementById('amountPaid').value = grandTotal.toFixed(2); // Default paid amount to total

    // Add event listeners for cart quantity changes and remove buttons
    document.querySelectorAll('.cart-qty-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.dataset.id;
            const newQuantity = parseFloat(e.target.value);
            updatePosCartItemQuantity(productId, newQuantity);
        });
    });
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id || e.target.closest('button').dataset.id;
            removeProductFromCart(productId);
        });
    });

    // Enable credit option if customer is selected
    if (selectedCustomerId) {
        document.getElementById('paymentMethod').querySelector('option[value="credit"]').disabled = false;
        document.getElementById('paymentMethod').value = 'credit'; // Auto-select credit if customer chosen
        updatePaymentAmountField(); // Adjust amount paid for credit
    } else {
        document.getElementById('paymentMethod').querySelector('option[value="credit"]').disabled = true;
        document.getElementById('paymentMethod').value = 'cash';
        document.getElementById('amountPaid').value = grandTotal.toFixed(2);
    }
}

function updatePaymentAmountField() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const amountPaidInput = document.getElementById('amountPaid');
    const grandTotal = getTotalCartAmount();

    if (paymentMethod === 'credit') {
        amountPaidInput.value = '0.00'; // Default paid 0 for credit
        amountPaidInput.readOnly = false; // Allow partial payment
    } else {
        amountPaidInput.value = grandTotal.toFixed(2); // Default paid full amount
        amountPaidInput.readOnly = false; // Allow overpayment for change
    }
}

// --- Customer Selection for POS ---
let customerScannerForPos = null;

function startBarcodeScannerForCustomer(targetInputId, scannerDivId) {
    const scannerContainer = document.getElementById(scannerDivId);
    scannerContainer.style.display = 'block';
    scannerContainer.innerHTML = `<div id="${scannerDivId}-reader" style="width: 100%;"></div><button class="btn btn-danger mt-2" id="stopCustomerScannerBtn">إيقاف الماسح</button>`;

    if (!customerScannerForPos) {
        customerScannerForPos = new Html5Qrcode(`${scannerDivId}-reader`);
    }

    customerScannerForPos.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText, decodedResult) => {
            console.log(`Customer Scan result: ${decodedText}`, decodedResult);
            document.getElementById(targetInputId).value = decodedText; // Fill phone input
            stopBarcodeScannerForCustomer(scannerDivId);
            await searchCustomersForPos(decodedText, true); // Search and select customer
        },
        (errorMessage) => {}
    )
    .catch((err) => {
        console.error(`Unable to start customer scanning: ${err}`);
        alert(`لا يمكن بدء ماسح العميل. تأكد من إعطاء إذن الكاميرا. الخطأ: ${err.message}`);
        stopBarcodeScannerForCustomer(scannerDivId);
    });

    document.getElementById('stopCustomerScannerBtn').addEventListener('click', () => stopBarcodeScannerForCustomer(scannerDivId));
}

function stopBarcodeScannerForCustomer(scannerDivId) {
    if (customerScannerForPos && customerScannerForPos.isScanning) {
        customerScannerForPos.stop().then(() => {
            console.log("Customer Scanner stopped.");
            document.getElementById(scannerDivId).style.display = 'none';
            document.getElementById(scannerDivId).innerHTML = '';
        }).catch((err) => {
            console.error("Error stopping customer scanner:", err);
        });
    } else {
        document.getElementById(scannerDivId).style.display = 'none';
        document.getElementById(scannerDivId).innerHTML = '';
    }
    // Reset scanner instance
    customerScannerForPos = null;
}

async function searchCustomersForPos(searchTerm, autoSelect = false) {
    const customerSearchResults = document.getElementById('customerSearchResults');
    customerSearchResults.innerHTML = ''; // Clear previous results

    let customersRef = collection(db, "customers");
    let q;

    if (searchTerm) {
        // Search by phone or name
        const isPhoneSearch = /^\d+$/.test(searchTerm) && searchTerm.length >= 7; // Heuristic for phone
        if (isPhoneSearch) {
            q = query(customersRef, where("phone", "==", searchTerm));
        } else {
            q = query(customersRef, orderBy("name"), where("name", ">=", searchTerm), where("name", "<=", searchTerm + '\uf8ff'));
        }
    } else {
        customerSearchResults.innerHTML = ''; // Don't show all if search is empty
        return;
    }

    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            customerSearchResults.innerHTML = '<div class="list-group-item">لا يوجد عملاء مطابقون.</div>';
            return;
        }

        if (autoSelect && snapshot.docs.length === 1) {
            const customerDoc = snapshot.docs[0];
            const customer = customerDoc.data();
            selectCustomerForSale(customerDoc.id, customer.name, customer.phone);
            return;
        }

        snapshot.forEach(customerDoc => {
            const customer = customerDoc.data();
            customerSearchResults.innerHTML += `
                <button type="button" class="list-group-item list-group-item-action customer-select-btn"
                        data-id="${customerDoc.id}" data-name="${customer.name}" data-phone="${customer.phone}">
                    ${customer.name} (${customer.phone}) - رصيد: ${customer.currentBalance ? customer.currentBalance.toFixed(2) : '0.00'}
                </button>
            `;
        });

        document.querySelectorAll('.customer-select-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                selectCustomerForSale(e.target.dataset.id, e.target.dataset.name, e.target.dataset.phone);
                customerSearchResults.innerHTML = ''; // Clear results after selection
                document.getElementById('customerSearchInput').value = ''; // Clear search input
            });
        });

    } catch (error) {
        console.error("Error searching customers for POS:", error);
        customerSearchResults.innerHTML = '<div class="list-group-item text-danger">خطأ في البحث عن العملاء.</div>';
    }
}

function selectCustomerForSale(customerId, customerName, customerPhone) {
    selectedCustomerId = customerId;
    selectedCustomerName = customerName;
    document.getElementById('selectedCustomerName').textContent = customerName;
    document.getElementById('selectedCustomerPhone').textContent = customerPhone;
    document.getElementById('selectedCustomerDisplay').classList.remove('d-none');
    document.getElementById('paymentMethod').querySelector('option[value="credit"]').disabled = false;
    document.getElementById('paymentMethod').value = 'credit'; // Auto-select credit
    updatePaymentAmountField(); // Adjust amount paid field

    // Optional: Hide customer search fields
    document.getElementById('customerSearchInput').closest('.input-group').style.display = 'none';
    document.getElementById('addNewCustomerBtn').style.display = 'none';
}

function clearSelectedCustomer() {
    selectedCustomerId = null;
    selectedCustomerName = '';
    document.getElementById('selectedCustomerDisplay').classList.add('d-none');
    document.getElementById('paymentMethod').querySelector('option[value="credit"]').disabled = true;
    document.getElementById('paymentMethod').value = 'cash'; // Reset to cash
    updatePaymentAmountField(); // Adjust amount paid field

    // Show customer search fields again
    document.getElementById('customerSearchInput').closest('.input-group').style.display = 'flex'; // Use flex to match Bootstrap input-group display
    document.getElementById('addNewCustomerBtn').style.display = 'block';
    document.getElementById('customerSearchInput').value = '';
    document.getElementById('customerSearchResults').innerHTML = ''; // Clear search results
}

// --- 6. Complete Sale ---
async function completeSale() {
    if (posCart.length === 0) {
        alert('سلة المشتريات فارغة!');
        return;
    }

    const grandTotal = getTotalCartAmount();
    const amountPaid = parseFloat(document.getElementById('amountPaid').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    let remainingBalance = 0;
    let isCreditSale = false;

    if (paymentMethod === 'credit') {
        if (!selectedCustomerId) {
            alert('الرجاء اختيار عميل لإتمام البيع الآجل.');
            return;
        }
        remainingBalance = grandTotal - amountPaid;
        isCreditSale = true;
    } else { // Cash sale
        if (amountPaid < grandTotal) {
            alert('المبلغ المدفوع أقل من الإجمالي في عملية البيع النقدي.');
            return;
        }
        remainingBalance = 0; // Should be 0 for cash
    }

    // --- Critical: Check Stock Availability ---
    const batch = db.batch(); // Use a Firestore batch for atomic updates

    for (const item of posCart) {
        const batchesRef = collection(db, `products/${item.productId}/batches`);
        const q = query(batchesRef, orderBy("createdAt", "desc")); // Get batches, order by creation date (latest first for LIFO)
        const snapshot = await getDocs(q);

        let quantityNeeded = item.quantity;
        let batchesToUpdate = [];

        // Find available batches and plan deductions
        for (const batchDoc of snapshot.docs) {
            const currentBatch = batchDoc.data();
            if (currentBatch.quantity > 0) {
                if (quantityNeeded <= currentBatch.quantity) {
                    batchesToUpdate.push({
                        docRef: doc(db, `products/${item.productId}/batches/${batchDoc.id}`),
                        oldQty: currentBatch.quantity,
                        newQty: currentBatch.quantity - quantityNeeded,
                        deductedQty: quantityNeeded,
                        batchId: batchDoc.id // Store batch ID for sale item
                    });
                    quantityNeeded = 0;
                    break; // All quantity satisfied
                } else {
                    // Deduct all from this batch and move to next
                    batchesToUpdate.push({
                        docRef: doc(db, `products/${item.productId}/batches/${batchDoc.id}`),
                        oldQty: currentBatch.quantity,
                        newQty: 0,
                        deductedQty: currentBatch.quantity,
                        batchId: batchDoc.id
                    });
                    quantityNeeded -= currentBatch.quantity;
                }
            }
        }

        if (quantityNeeded > 0) {
            alert(`كمية غير كافية من المنتج: ${item.name}. الكمية المطلوبة: ${item.quantity}, المتوفرة: ${item.quantity - quantityNeeded}`);
            return; // Stop sale process if stock is insufficient for any item
        }

        // Apply batch updates to Firestore batch
        batchesToUpdate.forEach(b => {
            batch.update(b.docRef, { quantity: b.newQty });
        });

        // Store selected batch info in cart item for sale record
        item.deductedBatches = batchesToUpdate.map(b => ({
            batchId: b.batchId,
            deductedQty: b.deductedQty
        }));
    }

    try {
        // Record the sale
        const saleDocRef = doc(collection(db, "sales")); // Create a new document reference first to get its ID
        batch.set(saleDocRef, {
            saleDate: new Date().toISOString(),
            customerId: selectedCustomerId,
            totalAmount: grandTotal,
            amountPaid: amountPaid,
            remainingBalance: remainingBalance,
            paymentMethod: paymentMethod,
            isCreditSale: isCreditSale,
            soldBy: auth.currentUser ? auth.currentUser.email : 'Unknown', // Record who sold it
        });

        // Add sale items as a subcollection to the sale document
        posCart.forEach(item => {
            item.deductedBatches.forEach(deductedBatch => {
                 // Add each deducted part of the item as a sale_item
                 batch.set(doc(collection(db, `sales/${saleDocRef.id}/saleItems`)), {
                    productId: item.productId,
                    productName: item.name,
                    unit: item.unit,
                    unitPrice: item.price,
                    quantity: deductedBatch.deductedQty, // This is the quantity from this specific batch
                    batchId: deductedBatch.batchId,
                    subtotal: deductedBatch.deductedQty * item.price,
                 });
            });
        });

        // Update customer balance if it's a credit sale
        if (isCreditSale) {
            const customerDocRef = doc(db, "customers", selectedCustomerId);
            batch.update(customerDocRef, {
                currentBalance: FieldValue.increment(remainingBalance) // This requires FieldValue, might need separate import
            });
            // Alternative to FieldValue.increment: Fetch customer, update balance, then update customer doc
            // For complex updates like this, a Cloud Function is highly recommended for atomicity.
        }

        await batch.commit(); // Commit all operations in one go

        alert('تم إتمام عملية البيع بنجاح!');
        posCart = []; // Clear cart
        selectedCustomerId = null;
        selectedCustomerName = '';
        loadSalesContent(); // Reload POS screen

    } catch (error) {
        console.error("Error completing sale:", error);
        alert(`خطأ في إتمام عملية البيع: ${error.message}. يرجى المحاولة مرة أخرى.`);
    }
}

// --- 7. Customer Management (إدارة العملاء - CRUD) ---
customersLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) {
        loadCustomersContent();
    } else {
        alert('يرجى تسجيل الدخول لعرض العملاء.');
        showLoginForm();
    }
});

async function loadCustomersContent() {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">إدارة العملاء</h2>
        <div class="input-group mb-3">
            <input type="text" class="form-control" id="customerListSearchInput" placeholder="ابحث برقم الهاتف أو الاسم...">
            <button class="btn btn-outline-secondary" type="button" id="customerListSearchBtn"><i class="bi bi-search"></i> بحث</button>
        </div>
        <button class="btn btn-primary mb-3" id="addCustomerBtn"><i class="bi bi-plus-lg"></i> إضافة عميل جديد</button>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>الهاتف</th>
                        <th>العنوان</th>
                        <th>الرصيد الحالي</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customersTableBody">
                    <tr><td colspan="5" class="text-center">جارٍ تحميل العملاء...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('addCustomerBtn').addEventListener('click', showAddCustomerForm);
    document.getElementById('customerListSearchBtn').addEventListener('click', () => fetchCustomers(document.getElementById('customerListSearchInput').value));
    document.getElementById('customerListSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchCustomers(document.getElementById('customerListSearchInput').value);
        }
    });

    await fetchCustomers();
}

async function fetchCustomers(searchTerm = '') {
    const customersTableBody = document.getElementById('customersTableBody');
    customersTableBody.innerHTML = '';

    let customersRef = collection(db, "customers");
    let q;

    if (searchTerm) {
        const isPhoneSearch = /^\d+$/.test(searchTerm) && searchTerm.length >= 7;
        if (isPhoneSearch) {
            q = query(customersRef, where("phone", "==", searchTerm));
        } else {
            q = query(customersRef, orderBy("name"), where("name", ">=", searchTerm), where("name", "<=", searchTerm + '\uf8ff'));
        }
    } else {
        q = query(customersRef, orderBy("name", "asc"));
    }

    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            customersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">لا يوجد عملاء مطابقون أو مسجلون.</td></tr>';
            return;
        }

        snapshot.forEach(customerDoc => {
            const customer = customerDoc.data();
            const customerId = customerDoc.id;
            const currentBalance = customer.currentBalance ? customer.currentBalance.toFixed(2) : '0.00';

            customersTableBody.innerHTML += `
                <tr>
                    <td>${customer.name}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>${customer.address || 'N/A'}</td>
                    <td>${currentBalance}</td>
                    <td>
                        <button class="btn btn-sm btn-info edit-customer-btn" data-id="${customerId}"><i class="bi bi-pencil-square"></i> تعديل</button>
                        <button class="btn btn-sm btn-success record-payment-btn" data-id="${customerId}" data-name="${customer.name}" data-balance="${currentBalance}"><i class="bi bi-cash-coin"></i> تسجيل دفعة</button>
                        <button class="btn btn-sm btn-danger delete-customer-btn" data-id="${customerId}"><i class="bi bi-trash"></i> حذف</button>
                    </td>
                </tr>
            `;
        });

        document.querySelectorAll('.edit-customer-btn').forEach(button => {
            button.addEventListener('click', (e) => showEditCustomerForm(e.target.dataset.id || e.target.closest('button').dataset.id));
        });
        document.querySelectorAll('.record-payment-btn').forEach(button => {
            button.addEventListener('click', (e) => showRecordPaymentForm(e.target.dataset.id || e.target.closest('button').dataset.id, e.target.dataset.name || e.target.closest('button').dataset.name, parseFloat(e.target.dataset.balance || 0)));
        });
        document.querySelectorAll('.delete-customer-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteCustomer(e.target.dataset.id || e.target.closest('button').dataset.id));
        });

    } catch (error) {
        console.error("Error fetching customers:", error);
        customersTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">حدث خطأ في جلب العملاء.</td></tr>';
    }
}

function showAddCustomerForm() {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">إضافة عميل جديد</h2>
        <div class="card p-4 mx-auto" style="max-width: 500px;">
            <div class="mb-3">
                <label for="customerName" class="form-label">الاسم:</label>
                <input type="text" class="form-control" id="customerName" required>
            </div>
            <div class="mb-3">
                <label for="customerPhone" class="form-label">رقم الهاتف:</label>
                <input type="text" class="form-control" id="customerPhone">
            </div>
            <div class="mb-3">
                <label for="customerAddress" class="form-label">العنوان:</label>
                <input type="text" class="form-control" id="customerAddress">
            </div>
            <button id="saveCustomerBtn" class="btn btn-success w-100">حفظ العميل</button>
            <button id="cancelCustomerBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
            <div id="customerFormError" class="alert alert-danger mt-3 d-none"></div>
        </div>
    `;
    document.getElementById('saveCustomerBtn').addEventListener('click', saveCustomer);
    document.getElementById('cancelCustomerBtn').addEventListener('click', loadCustomersContent);
}

async function saveCustomer() {
    const customerId = document.getElementById('customerId') ? document.getElementById('customerId').value : null;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerFormError = document.getElementById('customerFormError');

    customerFormError.classList.add('d-none');

    if (!customerName) {
        customerFormError.textContent = "اسم العميل مطلوب.";
        customerFormError.classList.remove('d-none');
        return;
    }

    const customerData = {
        name: customerName,
        phone: customerPhone || null,
        address: customerAddress || null,
        createdAt: customerId ? undefined : new Date().toISOString()
    };

    try {
        if (customerId) {
            const customerDocRef = doc(db, "customers", customerId);
            await updateDoc(customerDocRef, customerData);
            alert('تم تحديث العميل بنجاح!');
        } else {
            // Check if phone number already exists before adding a new customer
            if (customerPhone) {
                const q = query(collection(db, "customers"), where("phone", "==", customerPhone));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    customerFormError.textContent = "رقم الهاتف موجود بالفعل لعميل آخر.";
                    customerFormError.classList.remove('d-none');
                    return;
                }
            }
            await addDoc(collection(db, "customers"), { ...customerData, currentBalance: 0.00 });
            alert('تم إضافة العميل بنجاح!');
        }
        loadCustomersContent();
    } catch (error) {
        console.error("Error saving customer:", error);
        customerFormError.textContent = `خطأ في حفظ العميل: ${error.message}`;
        customerFormError.classList.remove('d-none');
    }
}

async function showEditCustomerForm(customerId) {
    try {
        const customerDocRef = doc(db, "customers", customerId);
        const customerDoc = await getDoc(customerDocRef);

        if (!customerDoc.exists()) {
            alert('العميل غير موجود!');
            loadCustomersContent();
            return;
        }

        const customer = customerDoc.data();
        contentArea.innerHTML = `
            <h2 class="text-center mb-4">تعديل عميل</h2>
            <div class="card p-4 mx-auto" style="max-width: 500px;">
                <input type="hidden" id="customerId" value="${customerId}">
                <div class="mb-3">
                    <label for="customerName" class="form-label">الاسم:</label>
                    <input type="text" class="form-control" id="customerName" value="${customer.name}" required>
                </div>
                <div class="mb-3">
                    <label for="customerPhone" class="form-label">رقم الهاتف:</label>
                    <input type="text" class="form-control" id="customerPhone" value="${customer.phone || ''}">
                </div>
                <div class="mb-3">
                    <label for="customerAddress" class="form-label">العنوان:</label>
                    <input type="text" class="form-control" id="customerAddress" value="${customer.address || ''}">
                </div>
                <button id="saveCustomerBtn" class="btn btn-success w-100">تحديث العميل</button>
                <button id="cancelCustomerBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
                <div id="customerFormError" class="alert alert-danger mt-3 d-none"></div>
            </div>
        `;
        document.getElementById('saveCustomerBtn').addEventListener('click', saveCustomer);
        document.getElementById('cancelCustomerBtn').addEventListener('click', loadCustomersContent);

    } catch (error) {
        console.error("Error loading customer for edit:", error);
        alert(`خطأ في تحميل بيانات العميل: ${error.message}`);
        loadCustomersContent();
    }
}

async function deleteCustomer(customerId) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا العميل؟ سيتم حذف جميع المدفوعات والمعاملات المرتبطة به.')) {
        return;
    }
    try {
        // In a real app, you'd check for outstanding debts or associated sales before deleting a customer.
        // For simplicity, we'll just delete the customer and their payments subcollection for now.
        // Sales associated with this customer will remain, but customerId field will be null if ON DELETE SET NULL equivalent is desired.

        // Delete associated payments (assuming payments are subcollections of customers or directly linked)
        // If payments are a top-level collection and linked by customerId, you'd query and delete them.
        const paymentsRef = collection(db, `customers/${customerId}/payments`); // If payments are subcollections
        const paymentsSnapshot = await getDocs(paymentsRef);
        const deletePaymentPromises = [];
        paymentsSnapshot.forEach(paymentDoc => {
            deletePaymentPromises.push(deleteDoc(doc(db, `customers/${customerId}/payments`, paymentDoc.id)));
        });
        await Promise.all(deletePaymentPromises);

        await deleteDoc(doc(db, "customers", customerId));
        alert('تم حذف العميل بنجاح!');
        loadCustomersContent();
    } catch (error) {
        console.error("Error deleting customer:", error);
        alert(`خطأ في حذف العميل: ${error.message}`);
    }
}

function showRecordPaymentForm(customerId, customerName, currentBalance) {
    contentArea.innerHTML = `
        <h2 class="text-center mb-4">تسجيل دفعة من العميل: ${customerName}</h2>
        <div class="card p-4 mx-auto" style="max-width: 500px;">
            <p>الرصيد الحالي المستحق: <strong>${currentBalance.toFixed(2)}</strong></p>
            <input type="hidden" id="paymentCustomerId" value="${customerId}">
            <input type="hidden" id="paymentCustomerName" value="${customerName}">
            <div class="mb-3">
                <label for="paymentAmount" class="form-label">المبلغ المدفوع:</label>
                <input type="number" class="form-control" id="paymentAmount" step="0.01" required value="${currentBalance.toFixed(2)}">
            </div>
            <div class="mb-3">
                <label for="paymentMethod" class="form-label">طريقة الدفع:</label>
                <select class="form-select" id="paymentMethod">
                    <option value="cash">نقدي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="other">أخرى</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="paymentNotes" class="form-label">ملاحظات (اختياري):</label>
                <textarea class="form-control" id="paymentNotes" rows="3"></textarea>
            </div>
            <button id="savePaymentBtn" class="btn btn-success w-100">تسجيل الدفعة</button>
            <button id="cancelPaymentBtn" class="btn btn-secondary w-100 mt-2">إلغاء</button>
            <div id="paymentFormError" class="alert alert-danger mt-3 d-none"></div>
        </div>
    `;

    document.getElementById('savePaymentBtn').addEventListener('click', savePayment);
    document.getElementById('cancelPaymentBtn').addEventListener('click', loadCustomersContent);
}

async function savePayment() {
    const customerId = document.getElementById('paymentCustomerId').value;
    const customerName = document.getElementById('paymentCustomerName').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentNotes = document.getElementById('paymentNotes').value;
    const paymentFormError = document.getElementById('paymentFormError');

    paymentFormError.classList.add('d-none');

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        paymentFormError.textContent = "المبلغ المدفوع يجب أن يكون أكبر من صفر.";
        paymentFormError.classList.remove('d-none');
        return;
    }

    // Use a Firestore batch for atomic updates
    const batch = writeBatch(db);

    try {
        // 1. Record the payment
        const paymentDocRef = doc(collection(db, "payments")); // Top-level payments collection
        batch.set(paymentDocRef, {
            customerId: customerId,
            customerName: customerName,
            amountPaid: paymentAmount,
            paymentMethod: paymentMethod,
            notes: paymentNotes || null,
            paymentDate: new Date().toISOString(),
            recordedBy: auth.currentUser ? auth.currentUser.email : 'Unknown'
        });

        // 2. Update customer's currentBalance
        const customerDocRef = doc(db, "customers", customerId);
        // Decrease customer balance (increment with a negative value)
        batch.update(customerDocRef, {
            currentBalance: FieldValue.increment(-paymentAmount) // Requires FieldValue import at top
        });

        await batch.commit(); // Commit all batch operations

        alert('تم تسجيل الدفعة بنجاح! وتحديث رصيد العميل.');
        loadCustomersContent(); // Refresh customer list

    } catch (error) {
        console.error("Error saving payment:", error);
        paymentFormError.textContent = `خطأ في تسجيل الدفعة: ${error.message}`;
        paymentFormError.classList.remove('d-none');
    }
}


// --- 8. Reports (التقارير - Placeholder) ---
reportsLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) {
        loadReportsContent();
    } else {
        alert('يرجى تسجيل الدخول لعرض التقارير.');
        showLoginForm();
    }
});

function loadReportsContent() {
    contentArea.innerHTML = `
        <h2 class="text-center">التقارير والإحصائيات</h2>
        <p>هذه الصفحة قيد الإنشاء. ستتضمن تقارير المبيعات والمخزون والديون هنا.</p>
    `;
}

// Initial load based on authentication status (already defined in `onAuthStateChanged`)
// No need for a separate DOMContentLoaded listener here for initial page load.
