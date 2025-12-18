// src/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Thay thế bằng thông tin cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAac3AGPpKcpG2mW1X7xjIa3OLOnTmqr6c",
  authDomain: "giftnity.firebaseapp.com",
  projectId: "giftnity",
  storageBucket: "giftnity.firebasestorage.app",
  messagingSenderId: "357477299116",
  appId: "1:357477299116:web:56e329f15f53eae6f58009",
  measurementId: "G-D2MQYWTKE6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Authentication Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
