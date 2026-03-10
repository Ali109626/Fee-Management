
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpkkdEODalAldKnBvDPVzApM8l3CBNSL4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fee-management-system-b5a9a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fee-management-system-b5a9a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fee-management-system-b5a9a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "244883328904",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:244883328904:web:ac79dcea153593e79bb43d"
};

// Check if Firebase is configured (either via env or hardcoded fallback)
export const isFirebaseConfigured = !!firebaseConfig.apiKey;

let app;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  // Initialize analytics only if in browser
  if (typeof window !== 'undefined') {
    getAnalytics(app);
  }
}

export { auth, db };
