import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

interface ProfilePageProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, onNavigateHome }) => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-trading-grid py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-[#0F1626] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* User Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-800">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl shadow-emerald-500/20 border-2 border-emerald-400/40">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'T'}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentUser?.name || 'Trader'}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNavigateHome}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors text-center"
            >
              Browse Courses
            </button>

            <button
              onClick={onLogout}
              className="py-3 px-6 rounded-xl font-bold text-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
