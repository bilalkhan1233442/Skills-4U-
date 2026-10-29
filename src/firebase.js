// ==============================================================================
// TRADEPRO ACADEMY - FIREBASE CONFIGURATION
// ==============================================================================
// 1. PASTE YOUR FIREBASE PROJECT CONFIG BELOW:
// Replace the placeholder values with your actual Firebase project settings
// from Firebase Console -> Project Settings -> General -> Your apps -> Web app
// ==============================================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY_HERE_REPLACE_ME",
  authDomain: "your-tradepro-academy.firebaseapp.com",
  projectId: "your-tradepro-academy",
  storageBucket: "your-tradepro-academy.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// ==============================================================================
// ADMIN EMAILS LIST
// ==============================================================================
// Users logging in with any of these emails automatically receive the "admin" role.
// Normal users not in this list will have role "user" and CANNOT see or access the Admin Panel.
// ==============================================================================
export const ADMIN_EMAILS = [
  "bilalkhan@gmail.com",
  "admin@example.com",
  "admin@tradepro.com",
  "chatgptgo12monthsfree@gmail.com"
];

// Helper to verify if an email has admin privileges
export const isUserAdmin = (email) => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === normalized);
};

// Check if config has been modified from placeholder
export const isConfigConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("YOUR_API_KEY") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("your-tradepro-academy")
  );
};

// Initialize Firebase App
let app = null;
let auth = null;
let db = null;
let storage = null;
let initError = null;

try {
  if (isConfigConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  initError = error;
  console.warn("Firebase initialization notice:", error);
}

export { app, auth, db, storage, initError };
