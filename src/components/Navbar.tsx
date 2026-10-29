import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../types';
import {
  TrendingUp,
  LayoutDashboard,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Compass
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, courseId?: string) => void;
  settings: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, settings }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                {settings.siteName || 'Skills 4U'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Crypto • Forex • Binary Masterclasses
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNav('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => handleNav('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentTab === 'profile'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            My Profile
          </button>

          {/* ADMIN ONLY BUTTON */}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
              Admin Panel
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold rounded">
                ADMIN
              </span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-800 mx-2" />

          {/* User info & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-white leading-tight">
                {currentUser?.name || 'Trader'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0F19] px-4 pt-3 pb-6 space-y-2">
          <div className="px-3 py-2 mb-2 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{currentUser?.name}</p>
            </div>
            {isAdmin && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
              currentTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Home / Courses
          </button>

          <button
            onClick={() => handleNav('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
              currentTab === 'profile'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-5 h-5" />
            My Profile
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                currentTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Admin Panel
            </button>
          )}

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
