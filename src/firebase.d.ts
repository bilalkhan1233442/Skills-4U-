import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

export declare const firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export declare const ADMIN_EMAILS: string[];
export declare const isUserAdmin: (email: string | null | undefined) => boolean;
export declare const isConfigConfigured: () => boolean;

export declare const app: FirebaseApp | null;
export declare const auth: Auth | null;
export declare const db: Firestore | null;
export declare const storage: FirebaseStorage | null;
export declare const initError: any;
