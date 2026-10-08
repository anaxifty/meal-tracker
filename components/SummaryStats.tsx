'use client';

import React from 'react';
import { Utensils, ShoppingBasket, Wifi, Wallet, TrendingUp, Info } from 'lucide-react';
import { MessOverallSummary } from '@/lib/calculations';
import { formatBdt } from '@/lib/bengali-utils';

interface SummaryStatsProps {
  summary: MessOverallSummary;
  memberCount: number;
}

export function SummaryStats({ summary, memberCount }: SummaryStatsProps) {
  const perHeadUtility = memberCount > 0 ? summary.totalUtilitiesExpense / memberCount : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Meal Rate */}
      <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute -right-3 -bottom-3 text-white/10">
          <TrendingUp className="w-20 h-20" />
        </div>
        <div className="flex items-center justify-between mb-1.5 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            মিল রেট (Meal Rate)
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight relative z-10">
          {formatBdt(summary.mealRate)}
          <span className="text-xs font-normal text-emerald-100 ml-1">/meal</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-100/90 font-medium relative z-10 flex items-center gap-1">
          <span>{formatBdt(summary.totalBazarExpense)} বাজার ÷ {summary.grandTotalMeals} মিল</span>
        </div>
      </div>

      {/* 2. Total Meals */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">মোট মিল (Meals)</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {summary.grandTotalMeals}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 font-medium">
          {memberCount} জন সক্রিয় সদস্য
        </div>
      </div>

      {/* 3. Total Bazar Expenditure */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">মোট বাজার খরচ</span>
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShoppingBasket className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {formatBdt(summary.totalBazarExpense)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 font-medium">
          মিল খরচের মূল ভিত্তি
        </div>
      </div>

      {/* 4. Shared Utilities (Wifi, Gas, Current) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">ওয়াইফাই, গ্যাস, বিল</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wifi className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {formatBdt(summary.totalUtilitiesExpense)}
        </div>
        <div className="mt-2 text-[11px] text-blue-600 font-medium">
          মাথাপিছু {formatBdt(perHeadUtility)}
        </div>
      </div>

      {/* 5. Mess Cash in Hand */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">হাতে ক্যাশ (Fund)</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl font-bold ${summary.fundCashInHand >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          {formatBdt(summary.fundCashInHand)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 font-medium">
          জমা {formatBdt(summary.totalDeposits)} থেকে খরচ বাদ
        </div>
      </div>
    </div>
  );
}
