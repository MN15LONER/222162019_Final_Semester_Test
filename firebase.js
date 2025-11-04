// firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { signInWithEmailAndPassword as _signInWithEmailAndPassword, createUserWithEmailAndPassword as _createUserWithEmailAndPassword, onAuthStateChanged as _onAuthStateChanged, signOut as _signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyChcZ2SQ4mgB1Su6_wyg6qD32wL2kgVkxY",
  authDomain: "semestertest2-6d13d.firebaseapp.com",
  databaseURL: "https://semestertest2-6d13d-default-rtdb.firebaseio.com",
  projectId: "semestertest2-6d13d",
  storageBucket: "semestertest2-6d13d.appspot.com",
  messagingSenderId: "79730576071",
  appId: "1:79730576071:web:5b83e057b08143d4a04ce2",
};

// ✅ Singleton pattern — initialize once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Initialize Auth with AsyncStorage persistence
// ✅ Initialize Auth with React Native persistence (AsyncStorage)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Initialize Database
export const database = getDatabase(app);

// ✅ Re-export helpers
export const signInWithEmailAndPassword = (email, password) =>
  _signInWithEmailAndPassword(auth, email, password);
export const createUserWithEmailAndPassword = (email, password) =>
  _createUserWithEmailAndPassword(auth, email, password);
export const onAuthStateChanged = (cb) => _onAuthStateChanged(auth, cb);
export const signOut = () => _signOut(auth);

export default app;
