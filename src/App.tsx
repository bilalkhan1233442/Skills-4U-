/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeToCourses,
  subscribeToSettings,
  initStorageIfEmpty
} from './services/dataService';
import { Course, SiteSettings, ToastMessage } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

// Main Application Content wrapped in AuthContext
const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading, logout, isAdmin } = useAuth();

  // Navigation State: 'dashboard' | 'course-detail' | 'profile' | 'admin'
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'course-detail' | 'profile' | 'admin'>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Real-time Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Skills 4U',
    whatsappNumber: '+923001234567',
    announcement: ''
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize storage if empty on mount
  useEffect(() => {
    initStorageIfEmpty();
  }, []);

  // Real-time Subscription to Courses
  useEffect(() => {
    const unsubscribeCourses = subscribeToCourses((updatedCourses) => {
      setCourses(updatedCourses);
      setCoursesLoading(false);
    });

    return () => unsubscribeCourses();
  }, []);

  // Real-time Subscription to Settings
  useEffect(() => {
    const unsubscribeSettings = subscribeToSettings((updatedSettings) => {
      setSettings(updatedSettings);
    });

    return () => unsubscribeSettings();
  }, []);

  // Sync hash routing for navigation & deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/course/')) {
        const id = hash.replace('/course/', '');
        setSelectedCourseId(id);
        setCurrentTab('course-detail');
      } else if (hash === '/admin') {
        setCurrentTab('admin');
      } else if (hash === '/profile') {
        setCurrentTab('profile');
      } else {
        setCurrentTab('dashboard');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Safe navigation handler
  const handleNavigate = (tab: string, courseId?: string) => {
    if (tab === 'course-detail' && courseId) {
      setSelectedCourseId(courseId);
      setCurrentTab('course-detail');
      window.location.hash = `/course/${courseId}`;
    } else if (tab === 'admin') {
      if (!isAdmin) {
        addToast('Admin panel is restricted to authorized administrators only.', 'error');
        return;
      }
      setCurrentTab('admin');
      window.location.hash = '/admin';
    } else if (tab === 'profile') {
      setCurrentTab('profile');
      window.location.hash = '/profile';
    } else {
      setSelectedCourseId(null);
      setCurrentTab('dashboard');
      window.location.hash = '/';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================================================
  // MOST IMPORTANT RULE — LOGIN GATE:
  // "Without login, the user can see NOTHING except the Login and Sign Up pages.
  // No courses, no course titles, no thumbnails, no prices on any public page.
  // Every other route is a protected route. If a logged-out user opens any link,
  // redirect them to /login automatically. Do not create any public home page."
  // ==========================================================================

  // While checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse mb-4">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-bold text-white tracking-wide">Skills 4U</p>
        <p className="text-xs text-slate-500 mt-1">Securing connection...</p>
      </div>
    );
  }

  // If NOT logged in: strictly show the Auth Page (Login / Sign Up / Forgot Password)
  if (!currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <AuthPage
          onSuccess={() => {
            setCurrentTab('dashboard');
            window.location.hash = '/';
          }}
          onToast={addToast}
        />
      </>
    );
  }

  // If user is logged in, find active course if on detail page
  const activeCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        settings={settings}
      />

      {/* View routing based on active tab */}
      <div className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardPage
            courses={courses}
            loading={coursesLoading}
            onSelectCourse={(courseId) => handleNavigate('course-detail', courseId)}
          />
        )}

        {currentTab === 'course-detail' && (
          activeCourse ? (
            <CourseDetailPage
              course={activeCourse}
              settings={settings}
              onBack={() => handleNavigate('dashboard')}
              onToast={addToast}
            />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-xl font-bold text-white">Course Not Found</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-sm">
                The requested course may have been unpublished or removed by the instructor.
              </p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
              >
                Return to Courses
              </button>
            </div>
          )
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            onLogout={async () => {
              await logout();
              addToast('Logged out successfully. See you again!', 'info');
            }}
            onNavigateHome={() => handleNavigate('dashboard')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            courses={courses}
            settings={settings}
            onToast={addToast}
            onPreviewCourse={(courseId) => handleNavigate('course-detail', courseId)}
          />
        )}
      </div>

      {/* Footer (Post-login only) */}
      <Footer settings={settings} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
