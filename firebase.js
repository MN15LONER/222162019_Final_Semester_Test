// firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { signInWithEmailAndPassword as _signInWithEmailAndPassword, createUserWithEmailAndPassword as _createUserWithEmailAndPassword, onAuthStateChanged as _onAuthStateChanged, signOut as _signOut, sendPasswordResetEmail as _sendPasswordResetEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCpSP-1p0H5kOvt9MXqOA_h3c-cv6TNvNE",
  authDomain: "semesterfinaltest.firebaseapp.com",
  projectId: "semesterfinaltest",
  storageBucket: "semesterfinaltest.firebasestorage.app",
  messagingSenderId: "355016067139",
  appId: "1:355016067139:web:169f240c234f2bb4bbacf6",
  measurementId: "G-NBFY7BVEEV"
};

// ✅ Singleton pattern — initialize once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Initialize Firestore
export const db = getFirestore(app);

// ✅ Re-export helpers
export const signInWithEmailAndPassword = (email, password) =>
  _signInWithEmailAndPassword(auth, email, password);
export const createUserWithEmailAndPassword = (email, password) =>
  _createUserWithEmailAndPassword(auth, email, password);
export const onAuthStateChanged = (cb) => _onAuthStateChanged(auth, cb);
export const signOut = () => _signOut(auth);
export const sendPasswordResetEmail = (email) => _sendPasswordResetEmail(auth, email);

export default app;
