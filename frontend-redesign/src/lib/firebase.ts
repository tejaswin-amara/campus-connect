import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD5u0vt99_cjjUB21cBMKQVFU1WXWYegsg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'campusconnect-afd1e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campusconnect-afd1e',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'campusconnect-afd1e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '228582852256',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:228582852256:web:b5a74c4258a2ff6ca6ebc5',
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
