// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr2-s-EkcOJJIts3ook8Iz2BSFnTSg-Tk",
  authDomain: "anas-66343.firebaseapp.com",
  projectId: "anas-66343",
  storageBucket: "anas-66343.firebasestorage.app",
  messagingSenderId: "595979858263",
  appId: "1:595979858263:web:dd2f1e6e3767320ede8e12"
};


// Initialize Firebase
// We check if an app is already initialized to prevent errors during hot-reloading in development.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
