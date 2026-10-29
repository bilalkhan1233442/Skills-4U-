export type CourseCategory = 'Crypto' | 'Forex' | 'Binary';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LockedLesson {
  id: string;
  title: string;
  duration: string;
}

export interface Course {
  id: string;
  title: string;
  traderName: string;
  category: CourseCategory;
  description: string;
  price: number;
  oldPrice?: number;
  level: CourseLevel;
  language: string;
  totalDuration: string;
  totalLessons: number;
  thumbnailUrl: string;
  demoVideoUrl: string;
  lockedLessons: {
    title: string;
    duration: string;
  }[];
  isPublished: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: any;
}

export interface SiteSettings {
  siteName: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber: string;
  announcement?: string;
}

export type SortOption = 'newest' | 'price-low' | 'price-high';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
