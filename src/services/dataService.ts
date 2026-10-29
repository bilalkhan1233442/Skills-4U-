import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isConfigConfigured } from '../firebase';
import { Course, SiteSettings, UserProfile } from '../types';

// Default initial settings
export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Skills 4U',
  logoUrl: '',
  bannerUrl: '',
  whatsappNumber: '+923001234567',
  announcement: ''
};

// Initial default sample courses
export const SAMPLE_COURSES: Omit<Course, 'id' | 'createdAt'>[] = [
  {
    title: 'Mastering Crypto Price Action & Smart Money Concepts',
    traderName: 'Sarmad Malik (Crypto Specialist)',
    category: 'Crypto',
    description: 'Learn institutional crypto trading from scratch. Master order blocks, liquidity sweeps, fair value gaps (FVG), high-probability scalping strategies on Binance & Bybit, and risk management for futures trading. Includes 1 free comprehensive demo breakdown.',
    price: 18000,
    oldPrice: 30000,
    level: 'Intermediate',
    language: 'Urdu / Hindi',
    totalDuration: '14 Hours',
    totalLessons: 18,
    thumbnailUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Can be replaced with any YouTube, Drive, or mp4 video
    isPublished: true,
    lockedLessons: [
      { title: 'Lesson 1: Market Structure & Break of Structure (BOS vs CHoCH)', duration: '45 mins' },
      { title: 'Lesson 2: Identifying Institutional Order Blocks & Mitigation', duration: '52 mins' },
      { title: 'Lesson 3: Fair Value Gaps (FVG) and Imbalance Fill Secrets', duration: '38 mins' },
      { title: 'Lesson 4: Liquidity Pool Identification & Stop Hunt Traps', duration: '55 mins' },
      { title: 'Lesson 5: 15m/5m/1m Top-Down Confluence Scalping Blueprint', duration: '60 mins' }
    ]
  },
  {
    title: 'Institutional Forex Trading: ICT & London/NY Killzones',
    traderName: 'Zeeshan Haider (FX Master)',
    category: 'Forex',
    description: 'Discover the exact strategies used to pass FTMO and prop firm challenges. Master London Open Judas swings, New York session reversals, currency correlation, and high risk-to-reward setups on EUR/USD, GBP/USD, and XAU/USD (Gold).',
    price: 22000,
    oldPrice: 35000,
    level: 'Advanced',
    language: 'Urdu / Hindi',
    totalDuration: '16 Hours',
    totalLessons: 22,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isPublished: true,
    lockedLessons: [
      { title: 'Lesson 1: Asian Session Consolidation & True Range Mapping', duration: '40 mins' },
      { title: 'Lesson 2: The London Judas Swing Manipulation Model', duration: '58 mins' },
      { title: 'Lesson 3: New York AM Killzone Entry & Silver Bullet Setup', duration: '50 mins' },
      { title: 'Lesson 4: Gold (XAUUSD) Volatility & News Trading Rules', duration: '44 mins' },
      { title: 'Lesson 5: Prop Firm 100K Account Risk Management Formula', duration: '65 mins' }
    ]
  },
  {
    title: 'Binary Options Sniper: 1-Minute Candlestick Reversals',
    traderName: 'Hamza Tariq (Binary Edge)',
    category: 'Binary',
    description: 'Specialized 1-minute and 5-minute binary options strategy for Quotex, Pocket Option, and Deriv. Master SNR rejection levels, candle psychology, wick exhaustion, and strict non-martingale money management with high win rates.',
    price: 15000,
    oldPrice: 25000,
    level: 'Beginner',
    language: 'Urdu / Hindi',
    totalDuration: '10 Hours',
    totalLessons: 14,
    thumbnailUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isPublished: true,
    lockedLessons: [
      { title: 'Lesson 1: Support & Resistance Level True Breakout vs Fakeout', duration: '35 mins' },
      { title: 'Lesson 2: Hammer, Shooting Star & Pinbar Rejection Confirmation', duration: '42 mins' },
      { title: 'Lesson 3: OTC Market Algorithm Analysis & Pattern Recognition', duration: '48 mins' },
      { title: 'Lesson 4: The 3-Candle Trend Continuation Strategy', duration: '39 mins' },
      { title: 'Lesson 5: Capital Protection, Daily Stop Loss & Psychological Discipline', duration: '50 mins' }
    ]
  }
];

// Local storage keys for fallback/instant mode
const STORAGE_COURSES_KEY = 'tradepro_courses_cache';
const STORAGE_SETTINGS_KEY = 'tradepro_settings_cache';
const STORAGE_USERS_KEY = 'tradepro_users_cache';
const STORAGE_CREDENTIALS_KEY = 'tradepro_credentials_cache';
const STORAGE_DELETED_COURSES_KEY = 'tradepro_deleted_courses_cache';
const STORAGE_INITIALIZED_KEY = 'tradepro_app_initialized_status_v2';

export const getDeletedCourseIdentifiers = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_COURSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveDeletedCourseIdentifier = (identifier: string) => {
  try {
    const list = getDeletedCourseIdentifiers();
    const clean = identifier.trim().toLowerCase();
    if (clean && !list.includes(clean)) {
      list.push(clean);
      localStorage.setItem(STORAGE_DELETED_COURSES_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
};

export const getStoredCredential = (email: string): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_CREDENTIALS_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      return map[email.toLowerCase().trim()] || null;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const saveUserCredential = (email: string, pass: string) => {
  try {
    const raw = localStorage.getItem(STORAGE_CREDENTIALS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[email.toLowerCase().trim()] = pass;
    localStorage.setItem(STORAGE_CREDENTIALS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error(e);
  }
};

// Simple event bus for reactive updates in local/fallback mode
class ReactiveBus {
  private listeners: { [key: string]: Set<(data: any) => void> } = {};

  subscribe(channel: string, callback: (data: any) => void) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = new Set();
    }
    this.listeners[channel].add(callback);
    return () => {
      this.listeners[channel]?.delete(callback);
    };
  }

  notify(channel: string, data: any) {
    this.listeners[channel]?.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error('Error in reactive listener:', e);
      }
    });
  }
}

export const eventBus = new ReactiveBus();

// Helper to get local courses with permanent deleted course filtering
export const getLocalCourses = (): Course[] => {
  try {
    const raw = localStorage.getItem(STORAGE_COURSES_KEY);
    if (raw) {
      const parsed: Course[] = JSON.parse(raw);
      const deletedIds = getDeletedCourseIdentifiers();
      if (deletedIds.length === 0) return parsed;
      return parsed.filter((c) => {
        const idMatch = deletedIds.includes((c.id || '').toLowerCase().trim());
        const titleMatch = c.title ? deletedIds.includes(c.title.toLowerCase().trim()) : false;
        return !idMatch && !titleMatch;
      });
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

// Helper to save local courses
export const saveLocalCourses = (courses: Course[]) => {
  localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(courses));
  eventBus.notify('courses', courses);
};

// Helper to get local settings
export const getLocalSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.siteName || parsed.siteName === 'TradePro Academy') {
        parsed.siteName = 'Skills 4U';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SETTINGS;
};

// Helper to save local settings
export const saveLocalSettings = (settings: SiteSettings) => {
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  eventBus.notify('settings', settings);
};

// Helper to get local users
export const getLocalUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveLocalUser = (user: UserProfile) => {
  const users = getLocalUsers();
  const index = users.findIndex((u) => u.uid === user.uid || u.email === user.email);
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  eventBus.notify('users', users);
};

// ==============================================================================
// REALTIME SUBSCRIBERS
// ==============================================================================

/**
 * Subscribe to courses in real-time.
 * If Firebase is configured and connected, uses Firestore onSnapshot.
 * Otherwise uses local reactive event bus with local storage fallback.
 */
export const subscribeToCourses = (callback: (courses: Course[]) => void): (() => void) => {
  // If Firestore is available and project is configured
  if (db && isConfigConfigured()) {
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const courses: Course[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Course, 'id'>)
          }));
          saveLocalCourses(courses);
          callback(courses);
        },
        (error) => {
          console.warn('Firestore subscription failed, falling back to cached local storage:', error);
          // Fallback to local
          const local = getLocalCourses();
          callback(local);
        }
      );

      // Return cleanup
      return unsubscribeFirestore;
    } catch (e) {
      console.warn('Error setting up Firestore listener, using local bus:', e);
    }
  }

  // Fallback: Reactive Event Bus
  const initial = getLocalCourses();
  callback(initial);
  const unsubBus = eventBus.subscribe('courses', (updated) => {
    callback(updated);
  });
  return unsubBus;
};

/**
 * Subscribe to site settings in real-time.
 */
export const subscribeToSettings = (callback: (settings: SiteSettings) => void): (() => void) => {
  if (db && isConfigConfigured()) {
    try {
      const docRef = doc(db, 'settings', 'site');
      const unsubscribeFirestore = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as SiteSettings;
            if (!data.siteName || data.siteName === 'TradePro Academy') {
              data.siteName = 'Skills 4U';
            }
            const merged = { ...DEFAULT_SETTINGS, ...data };
            saveLocalSettings(merged);
            callback(merged);
          } else {
            callback(getLocalSettings());
          }
        },
        (error) => {
          console.warn('Firestore settings subscription error, using local:', error);
          callback(getLocalSettings());
        }
      );
      return unsubscribeFirestore;
    } catch (e) {
      console.warn('Error setting up settings listener:', e);
    }
  }

  const initial = getLocalSettings();
  callback(initial);
  const unsubBus = eventBus.subscribe('settings', (updated) => {
    callback(updated);
  });
  return unsubBus;
};

/**
 * Subscribe to users list for Admin stats
 */
export const subscribeToUsersCount = (callback: (users: UserProfile[]) => void): (() => void) => {
  if (db && isConfigConfigured()) {
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }));
          callback(list);
        },
        () => {
          callback(getLocalUsers());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn(e);
    }
  }

  callback(getLocalUsers());
  return eventBus.subscribe('users', (updated) => {
    callback(updated);
  });
};

// ==============================================================================
// COURSE ACTIONS (Create, Edit, Delete, Seed)
// ==============================================================================

export const addCourse = async (courseData: Omit<Course, 'id' | 'createdAt'>): Promise<string> => {
  const newCourseItem: Omit<Course, 'id'> = {
    ...courseData,
    createdAt: new Date().toISOString()
  };

  if (db && isConfigConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...newCourseItem,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.warn('Firestore addDoc failed, writing to local fallback:', err);
    }
  }

  // Fallback to local
  const id = 'course_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const courses = getLocalCourses();
  const created: Course = { id, ...newCourseItem };
  courses.unshift(created);
  saveLocalCourses(courses);
  return id;
};

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<void> => {
  if (db && isConfigConfigured()) {
    try {
      const docRef = doc(db, 'courses', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return;
    } catch (err) {
      console.warn('Firestore updateDoc failed, writing to local fallback:', err);
    }
  }

  // Fallback to local
  const courses = getLocalCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index >= 0) {
    courses[index] = { ...courses[index], ...updates, updatedAt: new Date().toISOString() };
    saveLocalCourses(courses);
  }
};

export const deleteCourse = async (id: string): Promise<void> => {
  // Always mark that user has modified courses so auto-seeding will never restore them
  localStorage.setItem(STORAGE_INITIALIZED_KEY, 'true');

  const courses = getLocalCourses();
  const target = courses.find((c) => c.id === id);

  // Permanently record identifier so it cannot be auto-recreated
  saveDeletedCourseIdentifier(id);
  if (target?.title) {
    saveDeletedCourseIdentifier(target.title);
  }

  const filtered = courses.filter((c) => c.id !== id);
  saveLocalCourses(filtered);

  if (db && isConfigConfigured()) {
    try {
      const docRef = doc(db, 'courses', id);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.warn('Firestore deleteDoc failed, fallback to local storage:', err);
    }
  }
};

/**
 * Permanently deletes all 3 default/sample courses in one action
 */
export const deleteOldSampleCourses = async (): Promise<number> => {
  localStorage.setItem(STORAGE_INITIALIZED_KEY, 'true');
  const sampleTitles = SAMPLE_COURSES.map((s) => s.title.toLowerCase().trim());

  // Record all 3 sample course titles & patterns so they can NEVER be auto-restored
  sampleTitles.forEach((t) => saveDeletedCourseIdentifier(t));
  saveDeletedCourseIdentifier('sample_1');
  saveDeletedCourseIdentifier('sample_2');
  saveDeletedCourseIdentifier('sample_3');

  const courses = getLocalCourses();
  const toDelete = courses.filter((c) => {
    const isSampleId = c.id.startsWith('sample_');
    const isSampleTitle = sampleTitles.some((t) =>
      (c.title || '').toLowerCase().trim().includes(t.slice(0, 25))
    );
    return isSampleId || isSampleTitle;
  });

  toDelete.forEach((c) => {
    saveDeletedCourseIdentifier(c.id);
    if (c.title) saveDeletedCourseIdentifier(c.title);
  });

  const remaining = courses.filter((c) => !toDelete.some((d) => d.id === c.id));
  saveLocalCourses(remaining);

  if (db && isConfigConfigured()) {
    for (const c of toDelete) {
      try {
        await deleteDoc(doc(db, 'courses', c.id));
      } catch (err) {
        console.warn('Firestore delete error for sample course:', err);
      }
    }
  }

  return toDelete.length;
};

export const toggleCoursePublish = async (id: string, currentPublished: boolean): Promise<void> => {
  await updateCourse(id, { isPublished: !currentPublished });
};

// ==============================================================================
// SITE SETTINGS ACTIONS
// ==============================================================================

export const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<void> => {
  const current = getLocalSettings();
  const merged = { ...current, ...settings };

  if (db && isConfigConfigured()) {
    try {
      const docRef = doc(db, 'settings', 'site');
      await setDoc(docRef, merged, { merge: true });
      saveLocalSettings(merged);
      return;
    } catch (err) {
      console.warn('Firestore setDoc failed for settings, updating local:', err);
    }
  }

  saveLocalSettings(merged);
};

// ==============================================================================
// SEED SAMPLE COURSES
// ==============================================================================

export const seedSampleCoursesData = async (): Promise<number> => {
  localStorage.setItem(STORAGE_INITIALIZED_KEY, 'true');
  let count = 0;
  for (const sample of SAMPLE_COURSES) {
    // When manually requested, remove from deleted list
    const cleanTitle = sample.title.toLowerCase().trim();
    const deleted = getDeletedCourseIdentifiers().filter((d) => d !== cleanTitle);
    localStorage.setItem(STORAGE_DELETED_COURSES_KEY, JSON.stringify(deleted));

    await addCourse(sample);
    count++;
  }
  return count;
};

// ==============================================================================
// IMAGE UPLOAD HELPER (Storage with base64 / URL fallback)
// ==============================================================================

export const uploadCourseImage = async (file: File): Promise<string> => {
  if (storage && isConfigConfigured()) {
    try {
      const filename = `courses/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (e) {
      console.warn('Firebase Storage upload failed, converting to local data URL:', e);
    }
  }

  // Fallback: Read as Base64 Data URL so user can preview & use immediately
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
};

// Initialize default sample courses and admin if storage is empty on first load
export const initStorageIfEmpty = () => {
  const hasInitialized = localStorage.getItem(STORAGE_INITIALIZED_KEY);
  const rawCourses = localStorage.getItem(STORAGE_COURSES_KEY);

  // CRITICAL FIX: If app was already initialized OR if courses cache was ever created
  // (even if empty []), NEVER auto-seed sample courses!
  // Empty array means the admin purposefully deleted the courses.
  if (!hasInitialized && rawCourses === null) {
    localStorage.setItem(STORAGE_INITIALIZED_KEY, 'true');
    const deleted = getDeletedCourseIdentifiers();
    const sampleTitles = SAMPLE_COURSES.map((s) => s.title.toLowerCase().trim());
    const isAnyDeleted = sampleTitles.some((t) => deleted.includes(t));

    if (!isAnyDeleted) {
      const seeded: Course[] = SAMPLE_COURSES.map((sample, idx) => ({
        id: `sample_${idx + 1}_${Date.now()}`,
        ...sample,
        createdAt: new Date(Date.now() - idx * 3600000).toISOString()
      }));
      saveLocalCourses(seeded);
    } else {
      saveLocalCourses([]);
    }
  } else {
    // Ensure initialized flag is marked true
    localStorage.setItem(STORAGE_INITIALIZED_KEY, 'true');
  }

  const rawSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
  if (!rawSettings) {
    saveLocalSettings(DEFAULT_SETTINGS);
  } else {
    try {
      const parsed = JSON.parse(rawSettings);
      if (parsed.siteName === 'TradePro Academy') {
        parsed.siteName = 'Skills 4U';
        saveLocalSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Ensure default admin Bilal Khan is registered
  const users = getLocalUsers();
  const existingAdmin = users.find((u) => u.email.toLowerCase() === 'bilalkhan@gmail.com');
  if (!existingAdmin) {
    saveLocalUser({
      uid: 'admin_bilal_khan',
      name: 'Bilal Khan',
      email: 'bilalkhan@gmail.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
  }
  // Ensure default admin password
  saveUserCredential('bilalkhan@gmail.com', 'bilal12');
};

export const deleteUserAccount = async (uid: string): Promise<void> => {
  if (db && isConfigConfigured()) {
    try {
      const docRef = doc(db, 'users', uid);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Firestore delete user error:', e);
    }
  }

  const users = getLocalUsers();
  const filtered = users.filter((u) => u.uid !== uid);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(filtered));
  eventBus.notify('users', filtered);
};


