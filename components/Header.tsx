'use client';

import React from 'react';
import { UtensilsCrossed, Users, RefreshCw, Calendar, Download } from 'lucide-react';
import { Member } from '@/types/mess';

interface HeaderProps {
  monthYear: string;
  onMonthChange: (monthYear: string) => void;
  members: Member[];
  onOpenMembersModal: () => void;
  onResetDemo: () => void;
}

export function Header({
  monthYear,
  onMonthChange,
  members,
  onOpenMembersModal,
  onResetDemo,
}: HeaderProps) {
  // Format monthYear "2026-10" to readable string
  const [year, month] = monthYear.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, 1);
  const monthDisplay = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">MessMeal</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  মেস ম্যানেজার
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Natural Language Meal, Bazar & Expense Tracker
              </p>
            </div>
          </div>

          {/* Controls: Month selector, Member management, Reset demo */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Month Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500 ml-2" />
              <input
                type="month"
                value={monthYear}
                onChange={(e) => e.target.value && onMonthChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-800 px-2 py-1 outline-hidden cursor-pointer"
                aria-label="Select month"
              />
            </div>

            {/* Manage Members */}
            <button
              onClick={onOpenMembersModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>সদস্য ({members.filter((m) => m.active).length})</span>
            </button>

            {/* Reset to Demo */}
            <button
              onClick={onResetDemo}
              title="Reset to sample data"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">রিসেট ডেটা</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
