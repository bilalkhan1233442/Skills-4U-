import React from 'react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070A12] mt-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm font-bold text-white tracking-wide">
          {settings.siteName || 'Skills 4U'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Online Trading Courses
        </p>
      </div>
    </footer>
  );
};
