// Quick setup script — run once to set the password in Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDmSBnP3W-Y8K1qzVXLCZBzzbUzEFJqEkE",
    authDomain: "yaha-baat-karo.firebaseapp.com",
    databaseURL: "https://yaha-baat-karo-default-rtdb.firebaseio.com",
    projectId: "yaha-baat-karo",
    storageBucket: "yaha-baat-karo.firebasestorage.app",
    messagingSenderId: "979057975071",
    appId: "1:979057975071:web:1a9a0cc31247765ff4da2a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function setup() {
    try {
        await set(ref(db, 'config/password'), 'jeetdalla');
        console.log('✅ Password "jeetdalla" set in database!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setup();
