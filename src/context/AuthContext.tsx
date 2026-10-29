import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isUserAdmin, isConfigConfigured } from '../firebase';
import { UserProfile } from '../types';
import { saveLocalUser, getLocalUsers, saveUserCredential, getStoredCredential } from '../services/dataService';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  quickLoginAs: (role: 'admin' | 'user') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'tradepro_current_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state on load
  useEffect(() => {
    // If Firebase Auth is live and configured
    if (auth && isConfigConfigured()) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser && fbUser.email) {
          const userEmail = fbUser.email;
          const adminCheck = isUserAdmin(userEmail);
          const role = adminCheck ? 'admin' : 'user';

          let profileName = fbUser.displayName || userEmail.split('@')[0];

          // Fetch or populate user in Firestore
          if (db) {
            try {
              const userDocRef = doc(db, 'users', fbUser.uid);
              const snap = await getDoc(userDocRef);
              if (snap.exists()) {
                const data = snap.data();
                profileName = data.name || profileName;
              } else {
                await setDoc(userDocRef, {
                  name: profileName,
                  email: userEmail,
                  role: role,
                  createdAt: serverTimestamp()
                });
              }
            } catch (err) {
              console.warn('Firestore user fetch notice:', err);
            }
          }

          const userProfile: UserProfile = {
            uid: fbUser.uid,
            name: profileName,
            email: userEmail,
            role: role,
            createdAt: new Date().toISOString()
          };

          setCurrentUser(userProfile);
          saveLocalUser(userProfile);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));
        } else {
          setCurrentUser(null);
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local fallback mode: check localStorage session
      try {
        const stored = localStorage.getItem(LOCAL_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Re-evaluate admin role based on current ADMIN_EMAILS
          parsed.role = isUserAdmin(parsed.email) ? 'admin' : 'user';
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
  }, []);

  const signup = async (name: string, email: string, pass: string): Promise<void> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const role: 'admin' | 'user' = isUserAdmin(cleanEmail) ? 'admin' : 'user';

    if (auth && isConfigConfigured()) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        await updateProfile(cred.user, { displayName: name.trim() });

        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), {
            name: name.trim(),
            email: cleanEmail,
            role: role,
            createdAt: serverTimestamp()
          });
        }

        const profile: UserProfile = {
          uid: cred.user.uid,
          name: name.trim(),
          email: cleanEmail,
          role: role,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(profile);
        saveLocalUser(profile);
        saveUserCredential(cleanEmail, pass);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        setLoading(false);
        return;
      } catch (error: any) {
        setLoading(false);
        throw error;
      }
    }

    // Local simulated mode
    const fakeUid = 'user_' + Date.now();
    const profile: UserProfile = {
      uid: fakeUid,
      name: name.trim(),
      email: cleanEmail,
      role: role,
      createdAt: new Date().toISOString()
    };
    saveLocalUser(profile);
    saveUserCredential(cleanEmail, pass);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    setCurrentUser(profile);
    setLoading(false);
  };

  const login = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const role: 'admin' | 'user' = isUserAdmin(cleanEmail) ? 'admin' : 'user';

    // Strict password check for bilalkhan@gmail.com
    if (cleanEmail === 'bilalkhan@gmail.com' && pass !== 'bilal12') {
      setLoading(false);
      const err: any = new Error('Incorrect password. Please enter the correct password.');
      err.code = 'auth/wrong-password';
      throw err;
    }

    if (auth && isConfigConfigured()) {
      try {
        let cred;
        try {
          cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        } catch (signInErr: any) {
          // If user doesn't exist yet in the user's fresh Firebase project, and is bilalkhan with correct password bilal12
          if (cleanEmail === 'bilalkhan@gmail.com' && pass === 'bilal12' && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
            cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
            await updateProfile(cred.user, { displayName: 'Bilal Khan' });
          } else {
            throw signInErr;
          }
        }
        let name = cred.user.displayName || (cleanEmail === 'bilalkhan@gmail.com' ? 'Bilal Khan' : cleanEmail.split('@')[0]);

        if (db) {
          try {
            const userSnap = await getDoc(doc(db, 'users', cred.user.uid));
            if (userSnap.exists()) {
              name = userSnap.data()?.name || name;
            } else {
              await setDoc(doc(db, 'users', cred.user.uid), {
                name: name,
                email: cleanEmail,
                role: role,
                createdAt: serverTimestamp()
              });
            }
          } catch (e) {
            console.warn(e);
          }
        }

        const profile: UserProfile = {
          uid: cred.user.uid,
          name: name,
          email: cleanEmail,
          role: role,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(profile);
        saveLocalUser(profile);
        saveUserCredential(cleanEmail, pass);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        setLoading(false);
        return;
      } catch (error: any) {
        setLoading(false);
        throw error;
      }
    }

    // Local simulated mode: check credentials strictly
    if (cleanEmail === 'bilalkhan@gmail.com') {
      if (pass !== 'bilal12') {
        setLoading(false);
        const err: any = new Error('Incorrect password. Please enter the correct password.');
        err.code = 'auth/wrong-password';
        throw err;
      }
    } else {
      const storedPass = getStoredCredential(cleanEmail);
      const allUsers = getLocalUsers();
      const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!existing && !storedPass) {
        setLoading(false);
        const err: any = new Error('No user registered with this email. Please Sign Up first.');
        err.code = 'auth/user-not-found';
        throw err;
      }

      if (storedPass && pass !== storedPass) {
        setLoading(false);
        const err: any = new Error('Incorrect password. Please enter the correct password.');
        err.code = 'auth/wrong-password';
        throw err;
      }
    }

    const allUsers = getLocalUsers();
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    const name = existing ? existing.name : cleanEmail === 'bilalkhan@gmail.com' ? 'Bilal Khan' : cleanEmail.split('@')[0];
    const profile: UserProfile = {
      uid: existing ? existing.uid : (cleanEmail === 'bilalkhan@gmail.com' ? 'admin_bilal_khan' : 'usr_' + Date.now()),
      name: name,
      email: cleanEmail,
      role: role,
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    saveLocalUser(profile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    setCurrentUser(profile);
    setLoading(false);
  };

  const logout = async (): Promise<void> => {
    if (auth && isConfigConfigured()) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    if (auth && isConfigConfigured()) {
      await sendPasswordResetEmail(auth, cleanEmail);
      return;
    }
    // Simulation notice
    return new Promise((resolve) => setTimeout(resolve, 600));
  };

  // Quick switch for demo testing in preview environment
  const quickLoginAs = async (role: 'admin' | 'user'): Promise<void> => {
    const email = role === 'admin' ? 'admin@tradepro.com' : 'trader_student@gmail.com';
    const name = role === 'admin' ? 'TradePro Administrator' : 'Alex Mercer (Trader)';
    const profile: UserProfile = {
      uid: role === 'admin' ? 'admin_demo_id' : 'student_demo_id',
      name: name,
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    };
    saveLocalUser(profile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    setCurrentUser(profile);
  };

  const isAdmin = currentUser?.role === 'admin' || (currentUser?.email ? isUserAdmin(currentUser.email) : false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        signup,
        login,
        logout,
        resetPassword,
        quickLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
