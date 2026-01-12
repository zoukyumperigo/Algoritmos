/**
 * Firebase Configuration Template
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Create a new project or use existing one
 * 3. Add a Web app to your project
 * 4. Copy the configuration values
 * 5. Rename this file to 'firebase.ts'
 * 6. Replace the values below with your Firebase config
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  CLIENTS: 'clients',
  PRODUCTS: 'products',
  IMPORT_SESSIONS: 'import_sessions',
  NOTIFICATIONS: 'notifications',
};
