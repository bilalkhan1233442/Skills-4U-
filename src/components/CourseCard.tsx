import React from 'react';
import { Course } from '../types';
import { Play, Clock, BookOpen, User, Sparkles } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelect: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  // Calculate discount percentage if old price exists
  const discountPercent =
    course.oldPrice && course.oldPrice > course.price
      ? Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)
      : null;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Crypto':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Forex':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Binary':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div
      onClick={() => onSelect(course.id)}
      className="group relative rounded-2xl bg-[#0F1626] border border-slate-800/90 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full hover:shadow-xl hover:shadow-emerald-950/30 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Thumbnail with overlay & badge */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={
            course.thumbnailUrl ||
            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
          }
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1626] via-transparent to-black/30" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border backdrop-blur-md shadow-md ${getCategoryBadge(
              course.category
            )}`}
          >
            {course.category}
          </span>
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-500 text-slate-950 shadow-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Demo Video Indicator */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-black/60 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
            <Play className="w-3 h-3 fill-emerald-400" />
            Demo Free
          </span>
        </div>

        {/* Level badge */}
        <div className="absolute bottom-2 left-3">
          <span className="text-[11px] font-medium text-slate-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Trader Name */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-semibold">{course.traderName}</span>
          </div>

          {/* Metadata badges (Duration & Level) */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.totalDuration || '10+ Hours'}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium">{course.level}</span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                PKR {course.price.toLocaleString()}
              </span>
            </div>
            {course.oldPrice && course.oldPrice > course.price && (
              <span className="text-xs text-slate-400 line-through">
                PKR {course.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(course.id);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-200 group-hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Watch Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
