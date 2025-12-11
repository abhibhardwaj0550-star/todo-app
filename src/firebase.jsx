// 📁 firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCWQTZlcSt4hr1yLUnDzYKa4X_KO9TgyOA",
  authDomain: "todo-project-8b038.firebaseapp.com",
  projectId: "todo-project-8b038",
  storageBucket: "todo-project-8b038.firebasestorage.app",
  messagingSenderId: "19389756984",
  appId: "1:19389756984:web:52758fc82df888510f98cd",
  measurementId: "G-J27YFKYZ14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);                   // Firebase Auth instance
const provider = new GoogleAuthProvider();   // Google Auth provider

export { auth, provider };
