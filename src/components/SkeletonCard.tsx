import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden animate-pulse flex flex-col h-full">
      <div className="aspect-[16/9] w-full bg-slate-800/60" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 bg-slate-800 rounded-md" />
            <div className="h-4 w-16 bg-slate-800 rounded-md" />
          </div>
          <div className="h-6 w-full bg-slate-800 rounded-md" />
          <div className="h-4 w-3/4 bg-slate-800 rounded-md" />
          <div className="h-4 w-1/2 bg-slate-800 rounded-md" />
        </div>
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="h-7 w-24 bg-slate-800 rounded-md" />
          <div className="h-9 w-28 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
