import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to read .env manually
function readEnv() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.join(__dirname, '.env');
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key && value) env[key] = value;
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

// Helper to log to file
function log(message) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const logPath = path.join(__dirname, 'diagnostic_log.txt');
    try {
        fs.appendFileSync(logPath, message + '\n');
    } catch (e) {
        // ignore
    }
    console.log(message);
}

// Clear previous log
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logPath = path.join(__dirname, 'diagnostic_log.txt');
if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
}

const env = readEnv();

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

log('---------------------------------------------------');
log('🔍 Yaha Baat Karo - Diagnostic Tool');
log('---------------------------------------------------');
log('1. Checking Config...');
log(`   Project ID: ${firebaseConfig.projectId}`);
log(`   Database URL: ${firebaseConfig.databaseURL}`);

log('\n2. Connecting to Firebase...');
try {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    log('   ✅ App Initialized');

    log('\n3. Reading Password from Database...');
    const passwordRef = ref(db, 'config/password');

    // Timeout promise
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timed out after 10s')), 10000);
    });

    Promise.race([get(passwordRef), timeout])
        .then((snapshot) => {
            if (snapshot.exists()) {
                log(`   ✅ SUCCESS! Found password: "${snapshot.val()}"`);
                log('\n   🎉 Everything looks good! The app *should* work.');
            } else {
                log('   ❌ FAILURE: Password node does not exist!');
                log('   Run "node setup.mjs" to fix this.');
            }
            process.exit(0);
        })
        .catch((error) => {
            log(`   ❌ ERROR: Could not read database.`);
            log(`   Details: ${error.message}`);
            process.exit(1);
        });

} catch (error) {
    log(`   ❌ CRITICAL ERROR: ${error.message}`);
    process.exit(1);
}
