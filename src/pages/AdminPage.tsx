import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, SiteSettings, UserProfile, CourseCategory, CourseLevel } from '../types';
import {
  addCourse,
  updateCourse,
  deleteCourse,
  updateSiteSettings,
  seedSampleCoursesData,
  deleteOldSampleCourses,
  uploadCourseImage,
  subscribeToUsersCount,
  deleteUserAccount
} from '../services/dataService';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Settings as SettingsIcon,
  BookOpen,
  Users,
  Coins,
  Globe2,
  Binary,
  Upload,
  Link,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  Play,
  ArrowUpRight,
  Sparkles,
  Search,
  UserCheck,
  Calendar
} from 'lucide-react';

interface AdminPageProps {
  courses: Course[];
  settings: SiteSettings;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onPreviewCourse: (courseId: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  courses,
  settings,
  onToast,
  onPreviewCourse
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'settings'>('courses');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Add/Edit Course Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [traderName, setTraderName] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Crypto');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(15000);
  const [oldPrice, setOldPrice] = useState<number | undefined>(25000);
  const [level, setLevel] = useState<CourseLevel>('Intermediate');
  const [totalDuration, setTotalDuration] = useState('12 Hours');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Confirmation States (replaces window.confirm which fails in iframes)
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ uid: string; name: string } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isDeletingOldSamples, setIsDeletingOldSamples] = useState(false);

  // Settings State
  const [siteName, setSiteName] = useState(settings.siteName || 'Skills 4U');
  const [bannerUrl, setBannerUrl] = useState(settings.bannerUrl || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '+923001234567');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sync settings when changed from real-time listener
  useEffect(() => {
    setSiteName(settings.siteName || 'Skills 4U');
    setBannerUrl(settings.bannerUrl || '');
    setWhatsappNumber(settings.whatsappNumber || '+923001234567');
  }, [settings]);

  // Subscribe to users count for stats
  useEffect(() => {
    const unsub = subscribeToUsersCount((users) => {
      setUsersList(users);
    });
    return () => unsub();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-trading-grid flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
          <ShieldAlert className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          You do not have administrative privileges to view this portal.
        </p>
      </div>
    );
  }

  // Stats
  const totalCoursesCount = courses.length;
  const cryptoCount = courses.filter((c) => c.category === 'Crypto').length;
  const forexCount = courses.filter((c) => c.category === 'Forex').length;
  const binaryCount = courses.filter((c) => c.category === 'Binary').length;
  const totalUsersCount = Math.max(usersList.length, 1);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setTraderName('');
    setCategory('Crypto');
    setDescription('');
    setPrice(15000);
    setOldPrice(25000);
    setLevel('Intermediate');
    setTotalDuration('12 Hours');
    setThumbnailUrl('');
    setDemoVideoUrl('');
    setEditingId(null);
    setIsEditing(false);
  };

  // Open Edit Form
  const handleOpenEdit = (course: Course) => {
    setEditingId(course.id);
    setTitle(course.title);
    setTraderName(course.traderName);
    setCategory(course.category);
    setDescription(course.description);
    setPrice(course.price);
    setOldPrice(course.oldPrice);
    setLevel(course.level);
    setTotalDuration(course.totalDuration || '10 Hours');
    setThumbnailUrl(course.thumbnailUrl || '');
    setDemoVideoUrl(course.demoVideoUrl || '');
    setIsEditing(true);
  };

  // Handle Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !traderName.trim()) {
      onToast('Please fill in course title and trader name.', 'error');
      return;
    }

    try {
      setIsSaving(true);

      const coursePayload = {
        title: title.trim(),
        traderName: traderName.trim(),
        category,
        description: description.trim() || 'Comprehensive trading course covering market analysis, strategies, and risk management.',
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        level,
        language: 'Urdu / Hindi',
        totalDuration: totalDuration.trim() || '10 Hours',
        totalLessons: 1,
        thumbnailUrl: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        demoVideoUrl: demoVideoUrl.trim(),
        lockedLessons: [],
        isPublished: true
      };

      if (editingId) {
        await updateCourse(editingId, coursePayload);
        onToast('Course updated successfully in real-time!', 'success');
      } else {
        await addCourse(coursePayload);
        onToast('New course added and saved in real-time!', 'success');
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      onToast(err.message || 'Failed to save course', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Course Delete Modal
  const requestDeleteCourse = (id: string, courseTitle: string) => {
    setDeleteConfirmCourse({ id, title: courseTitle });
  };

  // Confirm Delete Course (Works reliably inside iframes without window.confirm)
  const handleConfirmDeleteCourse = async () => {
    if (!deleteConfirmCourse) return;
    try {
      setIsDeletingCourse(true);
      await deleteCourse(deleteConfirmCourse.id);
      onToast(`Course "${deleteConfirmCourse.title}" deleted successfully.`, 'info');
      if (editingId === deleteConfirmCourse.id) {
        resetForm();
      }
      setDeleteConfirmCourse(null);
    } catch (err: any) {
      console.error('Delete course error:', err);
      onToast(err.message || 'Failed to delete course', 'error');
    } finally {
      setIsDeletingCourse(false);
    }
  };

  // Open User Delete Modal
  const requestDeleteUser = (uid: string, userName: string) => {
    setDeleteConfirmUser({ uid, name: userName });
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      setIsDeletingUser(true);
      await deleteUserAccount(deleteConfirmUser.uid);
      setUsersList((prev) => prev.filter((u) => u.uid !== deleteConfirmUser.uid));
      onToast(`User "${deleteConfirmUser.name}" has been removed.`, 'info');
      setDeleteConfirmUser(null);
    } catch (err: any) {
      console.error('Delete user error:', err);
      onToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };



  // Check if any of the 3 default old sample courses exist
  const hasSampleCourses = courses.some((c) => {
    const isSampleId = c.id.startsWith('sample_');
    const isSampleTitle = [
      'crypto price action',
      'forex trading',
      'binary options sniper'
    ].some((term) => (c.title || '').toLowerCase().includes(term));
    return isSampleId || isSampleTitle;
  });

  // Permanently delete all 3 old sample courses
  const handleDeleteOldSamples = async () => {
    try {
      setIsDeletingOldSamples(true);
      const count = await deleteOldSampleCourses();
      onToast(`Permanently deleted ${count} old course(s). They will not reappear.`, 'success');
    } catch (err: any) {
      console.error(err);
      onToast(err.message || 'Failed to delete old courses', 'error');
    } finally {
      setIsDeletingOldSamples(false);
    }
  };

  // Handle Seed Sample Courses
  const handleSeedCourses = async () => {
    try {
      const count = await seedSampleCoursesData();
      onToast(`Added ${count} sample courses (Crypto, Forex & Binary)!`, 'success');
    } catch (err: any) {
      onToast(err.message || 'Failed to seed courses', 'error');
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await updateSiteSettings({
        siteName: siteName.trim(),
        bannerUrl: bannerUrl.trim(),
        whatsappNumber: whatsappNumber.trim(),
        logoUrl: '',
        announcement: ''
      });
      onToast('Site settings updated in real-time!', 'success');
    } catch (err: any) {
      onToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Thumbnail File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadCourseImage(file);
      setThumbnailUrl(url);
      onToast('Thumbnail uploaded successfully!', 'success');
    } catch (err: any) {
      onToast('Failed to upload image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };



  return (
    <div className="min-h-screen bg-trading-grid pb-24">
      {/* Admin Top Header */}
      <div className="border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ADMIN ACCESS
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Trading Academy Control Center
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage courses, pricing, demo videos, and WhatsApp contact settings.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {hasSampleCourses && (
              <button
                type="button"
                onClick={handleDeleteOldSamples}
                disabled={isDeletingOldSamples}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Permanently remove the 3 old sample courses so they never reappear"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>{isDeletingOldSamples ? 'Deleting...' : 'Delete 3 Old Courses'}</span>
              </button>
            )}

            <button
              onClick={handleSeedCourses}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
              title="Add 3 realistic sample courses (Crypto, Forex, Binary)"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Add Sample Courses</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setIsEditing(true);
              }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Course</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#0F1626] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Courses</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{totalCoursesCount}</p>
            <span className="text-[10px] text-emerald-400/80">Real-time synced</span>
          </div>

          <div
            onClick={() => setActiveTab('users')}
            className={`p-4 rounded-2xl bg-[#0F1626] border cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 group ${
              activeTab === 'users' ? 'border-blue-500 ring-1 ring-blue-500/40 bg-blue-950/20' : 'border-slate-800'
            }`}
            title="Click to view all registered users"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-400 transition-colors">Registered Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{totalUsersCount}</p>
            <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
              Click to view all &rarr;
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F1626] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Crypto Courses</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{cryptoCount}</p>
            <span className="text-[10px] text-amber-400/80">Binance/Bybit</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F1626] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Forex Courses</span>
              <Globe2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{forexCount}</p>
            <span className="text-[10px] text-emerald-400/80">ICT & Prop Firms</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F1626] border border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Binary Courses</span>
              <Binary className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{binaryCount}</p>
            <span className="text-[10px] text-rose-400/80">60s Sniper Setups</span>
          </div>
        </div>

        {/* Tab switchers: Courses Management vs Registered Users vs Site Settings */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Courses Management ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Registered Users ({totalUsersCount})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Site Settings & WhatsApp ({settings.siteName})
          </button>
        </div>

        {/* ==================================================================== */}
        {/* COURSES TABLE TAB */}
        {/* ==================================================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="bg-[#0F1626] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">All Courses Database</h3>
                  <p className="text-xs text-slate-400">
                    Real-time updates synced with Firestore onSnapshot listeners.
                  </p>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">No courses in the database yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Add Sample Courses" above to generate 3 ready-to-use courses instantly.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsEditing(true);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Create New Course</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSeedCourses}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                    >
                      Restore Sample Courses
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-slate-900/40 transition-colors">
                          {/* Course Thumbnail + Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  course.thumbnailUrl ||
                                  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80'
                                }
                                alt={course.title}
                                className="w-12 h-8 rounded-md object-cover bg-slate-800 shrink-0 border border-slate-700"
                              />
                              <div className="min-w-0 max-w-xs">
                                <p className="font-bold text-white truncate">{course.title}</p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  by {course.traderName}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                course.category === 'Crypto'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : course.category === 'Forex'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {course.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-white">
                              PKR {course.price.toLocaleString()}
                            </span>
                            {course.oldPrice && (
                              <span className="text-[10px] text-slate-500 block line-through">
                                PKR {course.oldPrice.toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* Duration */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-medium">
                            {course.totalDuration || '10 Hours'}
                          </td>

                          {/* Actions: Preview, Edit, Delete */}
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onPreviewCourse(course.id)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                                title="Preview Course Detail"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(course)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                title="Edit Course"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => requestDeleteCourse(course.id, course.title)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                title="Delete Course"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* REGISTERED USERS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-[#0F1626] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Registered Platform Users</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {usersList.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time list of all registered student traders and administrators.
                  </p>
                </div>

                {/* Search Bar for Users */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Users Table */}
              {usersList.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">No registered users yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    New users who sign up will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {usersList
                        .filter((u) => {
                          if (!userSearchQuery.trim()) return true;
                          const q = userSearchQuery.toLowerCase().trim();
                          return (
                            (u.name && u.name.toLowerCase().includes(q)) ||
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.role && u.role.toLowerCase().includes(q))
                          );
                        })
                        .map((user) => {
                          const isCurrentUserAdmin = user.role === 'admin';
                          const formattedDate = user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Active';

                          return (
                            <tr key={user.uid || user.email} className="hover:bg-slate-900/40 transition-colors">
                              {/* Avatar & Name */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isCurrentUserAdmin
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    }`}
                                  >
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-white truncate flex items-center gap-1.5">
                                      {user.name || 'Unnamed Trader'}
                                      {isCurrentUserAdmin && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                          ADMIN
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">
                                      ID: {user.uid}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Email Address */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="font-mono text-xs text-slate-300">
                                  {user.email}
                                </span>
                              </td>

                              {/* Role */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 w-fit ${
                                    isCurrentUserAdmin
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {isCurrentUserAdmin ? (
                                    <>
                                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Administrator</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Student Trader</span>
                                    </>
                                  )}
                                </span>
                              </td>

                              {/* Joined Date */}
                              <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{formattedDate}</span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => requestDeleteUser(user.uid, user.name || user.email)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                  title={`Remove ${user.name || user.email}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SETTINGS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-[#0F1626] border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Global Platform Settings (Firestore: settings/site)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Changes update immediately in real-time for all connected users.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Site Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform Site Name
                </label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official WhatsApp Contact Number (for Course Purchases)
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  Include international country code without spaces or dashes (e.g. +923001234567 or 923001234567).
                </p>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+923001234567"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-emerald-400 font-mono font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>


              {/* Save Settings Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving...' : 'Save Platform Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* ADD / EDIT COURSE MODAL */}
      {/* ==================================================================== */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in">
          <div className="bg-[#0F1626] border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {editingId ? 'Edit Trading Course' : 'Create New Trading Course'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure course details and free demo class link.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCourse} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Title & Trader Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Institutional Crypto Price Action"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Trader / Instructor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={traderName}
                    onChange={(e) => setTraderName(e.target.value)}
                    placeholder="e.g. Sarmad Malik"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 2: Category, Level, Total Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CourseCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Crypto">Crypto</option>
                    <option value="Forex">Forex</option>
                    <option value="Binary">Binary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CourseLevel)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Total Duration
                  </label>
                  <input
                    type="text"
                    value={totalDuration}
                    onChange={(e) => setTotalDuration(e.target.value)}
                    placeholder="e.g. 12 Hours"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 3: Price & Old Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Old Price (PKR, for discount badge)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={oldPrice || ''}
                    onChange={(e) => setOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Thumbnail (Upload to Firebase Storage OR paste URL) */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Course Thumbnail Image (Storage Upload OR Image URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="Paste Image URL (https://...)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-bold uppercase">OR</span>

                  <label className="cursor-pointer shrink-0 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {thumbnailUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="w-20 h-12 object-cover rounded-lg border border-slate-700"
                    />
                    <span className="text-[11px] text-emerald-400">Thumbnail preview ready</span>
                  </div>
                )}
              </div>

              {/* DEMO VIDEO URL (YouTube, Drive, Direct Link) */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Demo Video URL (The ONLY Playable Video in the Course)
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports YouTube link (<code className="text-emerald-400">youtube.com/watch?v=...</code>), Google Drive preview link (<code className="text-emerald-400">drive.google.com/file/d/.../preview</code>), or direct MP4 link.
                </p>
                <input
                  type="url"
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or Google Drive preview link"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => requestDeleteCourse(editingId, title || 'this course')}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Course</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : editingId ? 'Update Course' : 'Save Course'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* COURSE DELETE CONFIRMATION MODAL (Bypasses iframe window.confirm blocks) */}
      {/* ==================================================================== */}
      {deleteConfirmCourse && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0F1626] border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">
              Delete Course?
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="text-white font-semibold underline decoration-rose-500/50">
                "{deleteConfirmCourse.title}"
              </span>
              ?
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmCourse(null)}
                disabled={isDeletingCourse}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                disabled={isDeletingCourse}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingCourse ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* USER DELETE CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0F1626] border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">
              Remove User?
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to remove user{' '}
              <span className="text-white font-semibold underline decoration-rose-500/50">
                "{deleteConfirmUser.name}"
              </span>
              ?
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingUser ? 'Removing...' : 'Yes, Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
