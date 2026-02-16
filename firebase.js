// ============================================
// Firebase Configuration
// ============================================
// This file sets up Firebase for our app.
// We use Firebase Realtime Database to:
//   1. Store the app password (for the landing page gate)
//   2. Store the list of voice chat rooms (for the lobby)

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, onValue, remove, update } from 'firebase/database';

// These values come from your .env file
// (we'll fill them in after creating the Firebase project)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export everything we need
export { database, ref, set, get, push, onValue, remove, update };
