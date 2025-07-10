// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsj0lbEBfQsANNiQXdFJXxIB72uQvbg9I",
  authDomain: "memory-cards-f5247.firebaseapp.com",
  projectId: "memory-cards-f5247",
  storageBucket: "memory-cards-f5247.firebasestorage.app",
  messagingSenderId: "245720012590",
  appId: "1:245720012590:web:2cce3e02b6c7c6d5000cbf"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
