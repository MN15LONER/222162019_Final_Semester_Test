import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, addDoc, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { auth, db } from '../firebase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [cart, setCart] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState({ code: 'ZAR', name: 'South African Rand', symbol: 'R' });
  const currencies = [
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  const persistLocal = async (items) => {
    try {
      await AsyncStorage.setItem('@shez_cart', JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist cart locally', err);
    }
  };

  const loadLocalCart = async () => {
    try {
      const raw = await AsyncStorage.getItem('@shez_cart');
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to load local cart', err);
    }
    return [];
  };

  const writeCartToDB = async (uid, items) => {
    if (!uid) return;
    try {
      const cartDoc = doc(db, 'carts', uid);
      await setDoc(cartDoc, { items });
    } catch (err) {
      console.warn('DB write failed', err);
    }
  };

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@onboarding_completed');
      setOnboardingCompleted(value === 'true');
    } catch (err) {
      console.warn('Failed to check onboarding', err);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      setOnboardingCompleted(true);
    } catch (err) {
      console.warn('Failed to complete onboarding', err);
    }
  };

  const createUserProfile = async (uid, name, email) => {
    try {
      const userDoc = doc(db, 'users', uid);
      await setDoc(userDoc, { name, email, createdAt: new Date() });
    } catch (err) {
      console.warn('Failed to create user profile', err);
    }
  };

  const updateUserProfile = async (uid, updates) => {
    try {
      const userDoc = doc(db, 'users', uid);
      await updateDoc(userDoc, updates);
      if (updates.displayName) {
        setUser(prev => prev ? { ...prev, displayName: updates.displayName } : null);
      }
    } catch (err) {
      console.warn('Failed to update user profile', err);
    }
  };

  const addBooking = async (booking) => {
    if (!user) return;
    try {
      const bookingsCol = collection(db, 'bookings');
      await addDoc(bookingsCol, { ...booking, userId: user.uid, createdAt: new Date() });
    } catch (err) {
      console.warn('Failed to add booking', err);
    }
  };

  const addReview = async (hotelId, review) => {
    if (!user) return;
    try {
      const reviewsCol = collection(db, 'reviews');
      await addDoc(reviewsCol, { hotelId, ...review, userId: user.uid, userName: user.displayName || 'Anonymous', createdAt: new Date() });
    } catch (err) {
      console.warn('Failed to add review', err);
    }
  };



  const addToCart = async (product, qty = 1) => {
    const existing = cart.find((c) => c.id === product.id);
    let next;
    if (existing) {
      next = cart.map((c) => (c.id === product.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      next = [...cart, { id: product.id, title: product.title, price: product.price, image: product.image, quantity: qty }];
    }
    setCart(next);
    persistLocal(next);
    if (user) await writeCartToDB(user.uid, next);
  };

  const setItemQuantity = async (id, quantity) => {
    let next = cart.map((c) => (c.id === id ? { ...c, quantity: Math.max(0, quantity) } : c));
    next = next.filter((c) => c.quantity > 0);
    setCart(next);
    persistLocal(next);
    if (user) await writeCartToDB(user.uid, next);
  };

  const removeItem = async (id) => {
    const next = cart.filter((c) => c.id !== id);
    setCart(next);
    persistLocal(next);
    if (user) await writeCartToDB(user.uid, next);
  };

  const clearCart = async () => {
    setCart([]);
    persistLocal([]);
    if (user) await writeCartToDB(user.uid, []);
  };

  useEffect(() => {
    checkOnboarding();
    let cartOff = null;
    let bookingsOff = null;
    let reviewsOff = null;
    const unsub = onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        // Cart listener
        if (cartOff) {
          try { cartOff(); } catch (e) {}
          cartOff = null;
        }
        const cartDoc = doc(db, 'carts', fbUser.uid);
        cartOff = onSnapshot(cartDoc, async (docSnap) => {
          const data = docSnap.data();
          if (data && data.items) {
            setCart(data.items);
            persistLocal(data.items);
          } else {
            const local = await loadLocalCart();
            setCart(local);
          }
        }, (err) => console.warn('Cart listener error', err));

        // Bookings listener
        if (bookingsOff) {
          try { bookingsOff(); } catch (e) {}
          bookingsOff = null;
        }
        const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', fbUser.uid));
        bookingsOff = onSnapshot(bookingsQuery, (querySnap) => {
          const bookingsData = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBookings(bookingsData);
        }, (err) => console.warn('Bookings listener error', err));

        // Reviews listener
        if (reviewsOff) {
          try { reviewsOff(); } catch (e) {}
          reviewsOff = null;
        }
        const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', fbUser.uid));
        reviewsOff = onSnapshot(reviewsQuery, (querySnap) => {
          const reviewsData = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReviews(reviewsData);
        }, (err) => console.warn('Reviews listener error', err));

        setInitializing(false);
      } else {
        setUser(null);
        setCart([]);
        setBookings([]);
        setReviews([]);
        if (cartOff) {
          try { cartOff(); } catch (e) {}
          cartOff = null;
        }
        if (bookingsOff) {
          try { bookingsOff(); } catch (e) {}
          bookingsOff = null;
        }
        if (reviewsOff) {
          try { reviewsOff(); } catch (e) {}
          reviewsOff = null;
        }
        loadLocalCart().then((local) => setCart(local));
        setInitializing(false);
      }
    });
    return () => {
      try { unsub(); } catch (e) {}
      if (cartOff) {
        try { cartOff(); } catch (e) {}
      }
      if (bookingsOff) {
        try { bookingsOff(); } catch (e) {}
      }
      if (reviewsOff) {
        try { reviewsOff(); } catch (e) {}
      }
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
      setCart([]);
    } catch (err) {
      console.warn('Sign out error', err);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        initializing,
        cart,
        bookings,
        reviews,
        onboardingCompleted,
        selectedCurrency,
        setSelectedCurrency,
        currencies,
        addToCart,
        setItemQuantity,
        removeItem,
        clearCart,
        addBooking,
        addReview,
        createUserProfile,
        updateUserProfile,
        completeOnboarding,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

