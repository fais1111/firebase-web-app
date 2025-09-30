// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDr2-s-EkcOJJIts3ook8Iz2BSFnTSg-Tk',
  authDomain: 'anas-66343.firebaseapp.com',
  projectId: 'anas-66343',
  storageBucket: 'anas-66343.appspot.com',
  messagingSenderId: '595979858263',
  appId: '1:595979858263:web:dd2f1e6e3767320ede8e12',
};

// This function ensures a single instance of the Firebase app is used.
function getFirebaseInstances() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  return { app, auth, db, storage };
}

const { app, auth, db, storage } = getFirebaseInstances();

export { app, auth, db, storage, GoogleAuthProvider };
