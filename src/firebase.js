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
let app;
let database;

try {
    // Check if critical config is missing
    const missingKeys = Object.keys(firebaseConfig).filter(key => !firebaseConfig[key]);
    if (missingKeys.length > 0) {
        throw new Error(`Missing Firebase config keys: ${missingKeys.join(', ')}`);
    }

    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase Initialization Error:', error);
    // Fallback: create a dummy database object to prevent immediate crash on import
    database = {
        ref: () => { },
        set: () => Promise.reject('Firebase not initialized'),
        get: () => Promise.reject('Firebase not initialized'),
        push: () => { },
        onValue: () => { },
        remove: () => Promise.reject('Firebase not initialized'),
        update: () => Promise.reject('Firebase not initialized')
    };
}

// Export everything we need
import { runTransaction } from 'firebase/database';
export { database, ref, set, get, push, onValue, remove, update, runTransaction };
