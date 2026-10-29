import React, { useState, useMemo } from 'react';
import { Course, CourseCategory } from '../types';
import { CourseCard } from '../components/CourseCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  BookOpen,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface DashboardPageProps {
  courses: Course[];
  loading: boolean;
  onSelectCourse: (courseId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  courses,
  loading,
  onSelectCourse
}) => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'All'>('All');

  // Filter & sort
  const visibleCourses = useMemo(() => {
    let list = courses.filter((c) => (isAdmin ? true : c.isPublished !== false));

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.traderName.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Default newest first
    return [...list].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [courses, isAdmin, selectedCategory, searchQuery]);

  // Quick stats
  const categoryCounts = useMemo(() => {
    const list = courses.filter((c) => (isAdmin ? true : c.isPublished !== false));
    return {
      all: list.length,
      crypto: list.filter((c) => c.category === 'Crypto').length,
      forex: list.filter((c) => c.category === 'Forex').length,
      binary: list.filter((c) => c.category === 'Binary').length
    };
  }, [courses, isAdmin]);

  return (
    <div className="min-h-screen bg-trading-grid pb-20">
      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Search, Category Filters, Sort Bar */}
        <div className="space-y-4 mb-8">
          {/* Search bar */}
          <div className="relative w-full max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course title or trader name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                { label: 'All Courses', value: 'All', count: categoryCounts.all },
                { label: 'Crypto Trading', value: 'Crypto', count: categoryCounts.crypto },
                { label: 'Forex Trading', value: 'Forex', count: categoryCounts.forex },
                { label: 'Binary Options', value: 'Binary', count: categoryCounts.binary }
              ] as const
            ).map((tab) => {
              const isActive = selectedCategory === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 border border-emerald-400 scale-[1.02]'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : visibleCourses.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-slate-800 bg-[#0F1626]/50 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              No courses found
            </h3>
            <p className="text-sm text-slate-400">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try resetting your search filters to find what you are looking for.'
                : 'No courses yet — new courses coming soon.'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-xl border border-emerald-500/30 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={onSelectCourse}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
