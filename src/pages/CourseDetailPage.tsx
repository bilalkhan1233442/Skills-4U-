import React from 'react';
import { Course, SiteSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  ArrowLeft,
  User,
  Play,
  Share2
} from 'lucide-react';

interface CourseDetailPageProps {
  course: Course;
  settings: SiteSettings;
  onBack: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  settings,
  onBack,
  onToast
}) => {
  const { currentUser } = useAuth();

  // Clean WhatsApp Number from Firestore settings
  const cleanPhone = (settings.whatsappNumber || '+923001234567').replace(/[^0-9]/g, '');

  // Format pre-filled WhatsApp message strictly according to specification:
  // "Assalamualaikum, I want to buy the full course: [Course Title] by [Trader Name]. Price: [Price]. My email is: [logged-in user email]"
  const formattedPrice = `PKR ${course.price.toLocaleString()}`;
  const userEmail = currentUser?.email || 'my-registered-email@example.com';
  const rawMessage = `Assalamualaikum, I want to buy the full course: ${course.title} by ${course.traderName}. Price: ${formattedPrice}. My email is: ${userEmail}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;

  const discountPercent =
    course.oldPrice && course.oldPrice > course.price
      ? Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)
      : null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onToast('Course link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-trading-grid pb-16">
      {/* Top navigation bar */}
      <div className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-16 sm:top-20 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Share Course"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (2 Columns on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {course.category}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Level: {course.level}
                </span>
                {discountPercent && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-amber-500 text-slate-950 shadow-md">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Trader / Instructor Info */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Course Trader / Instructor</p>
                  <p className="text-sm font-bold text-white">{course.traderName}</p>
                </div>
              </div>
            </div>

            {/* DEMO CLASS SECTION (The ONLY playable video) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  Free Demo Class (Watch Now)
                </h2>
              </div>

              <p className="text-xs text-slate-400">
                Experience the teaching style and real strategy analysis before purchasing the full course.
              </p>

              <VideoPlayer
                videoUrl={course.demoVideoUrl}
                title={course.title}
                posterUrl={course.thumbnailUrl}
              />
            </div>
          </div>

          {/* Right Column: Pricing & WhatsApp Buy Card (Desktop sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-36 rounded-2xl bg-[#0F1626] border border-slate-800 p-6 space-y-6 shadow-2xl">
              {/* Thumbnail preview */}
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={
                    course.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Price block */}
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Full Course Lifetime Access
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    PKR {course.price.toLocaleString()}
                  </span>
                  {course.oldPrice && course.oldPrice > course.price && (
                    <span className="text-sm text-slate-400 line-through">
                      PKR {course.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {discountPercent && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    🎉 You save PKR {(course.oldPrice! - course.price).toLocaleString()} ({discountPercent}% discount)
                  </p>
                )}
              </div>

              {/* WhatsApp Buy Section */}
              <div className="pt-2 space-y-2 border-t border-slate-800/80">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Buy Full Course on WhatsApp</span>
                </a>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Direct chat on WhatsApp for fast payment and instant course access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
