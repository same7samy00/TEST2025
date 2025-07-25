<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تسجيل الدخول | عطارة الشفاء</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Cairo', sans-serif;
    }

    body {
      margin: 0;
      background: linear-gradient(135deg, #f4efe4, #d0e3c4);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .login-container {
      background-color: #fff;
      padding: 30px 20px;
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    .login-container h2 {
      text-align: center;
      margin-bottom: 20px;
      color: #4b6043;
    }

    .login-container input {
      width: 100%;
      padding: 12px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }

    .login-container button {
      width: 100%;
      padding: 12px;
      background-color: #6d8b5d;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .login-container button:hover {
      background-color: #59764b;
    }

    .error-msg {
      color: red;
      text-align: center;
      font-size: 14px;
      margin-top: 10px;
    }

    @media (max-width: 500px) {
      .login-container {
        margin: 10px;
      }
    }
  </style>
</head>
<body>

  <div class="login-container">
    <h2>تسجيل الدخول</h2>
    <form id="loginForm">
      <input type="email" id="email" placeholder="البريد الإلكتروني" required />
      <input type="password" id="password" placeholder="كلمة المرور" required />
      <button type="submit">دخول</button>
    </form>
    <p class="error-msg" id="errorMsg"></p>
  </div>

  <!-- Firebase + Auth -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyC5ls-rPdJ65x5BoMGwAOpdcPtD585C2ys",
      authDomain: "pharmacy-inventory-bf04a.firebaseapp.com",
      projectId: "pharmacy-inventory-bf04a",
      storageBucket: "pharmacy-inventory-bf04a.firebasestorage.app",
      messagingSenderId: "937788650384",
      appId: "1:937788650384:web:6451225d00e648f3a0b915",
      measurementId: "G-ZGC9EQ55SL"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html"; // غير للصفحة التالية
      } catch (error) {
        errorMsg.textContent = "بيانات الدخول غير صحيحة، حاول مرة أخرى.";
      }
    });
  </script>

</body>
</html>
