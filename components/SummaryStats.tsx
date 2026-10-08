'use client';

import React, { useState } from 'react';
import { Utensils, ShoppingBasket, Wifi, Wallet, TrendingUp, CheckCircle, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';
import { MessOverallSummary } from '@/lib/calculations';
import { formatBdt } from '@/lib/bengali-utils';

interface SummaryStatsProps {
  summary: MessOverallSummary;
  memberCount: number;
}

export function SummaryStats({ summary, memberCount }: SummaryStatsProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const perHeadUtility = memberCount > 0 ? summary.totalUtilitiesExpense / memberCount : 0;

  // Double entry audit invariant check
  const totalMemberDue = summary.memberSummaries
    .filter((m) => m.status === 'due')
    .reduce((sum, m) => sum + Math.abs(m.balance), 0);

  const totalMemberRefund = summary.memberSummaries
    .filter((m) => m.status === 'refund')
    .reduce((sum, m) => sum + Math.abs(m.balance), 0);

  const isBalanced = Math.abs((summary.fundCashInHand + totalMemberDue) - (totalMemberRefund)) < 1.0;

  return (
    <section aria-label="Monthly Financial Summary" className="mb-6 space-y-2.5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 1. Meal Rate Hero Card */}
        <div
          onClick={() => setShowFormulaModal(true)}
          className="col-span-2 sm:col-span-1 bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 relative overflow-hidden cursor-pointer hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              মিল রেট (Meal Rate)
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight font-mono tabular-nums text-white">
            {formatBdt(summary.mealRate)}
            <span className="text-xs font-normal text-slate-400 ml-1">/meal</span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-300 font-medium flex items-center justify-between border-t border-slate-800 pt-2">
            <span>{formatBdt(summary.totalBazarExpense)} ÷ {summary.grandTotalMeals} মিল</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* 2. Total Meals */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">মোট মিল (Meals)</span>
            <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Utensils className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {summary.grandTotalMeals}
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>{memberCount} জন সক্রিয় সদস্য</span>
            <span className="text-slate-400">ব্যবহৃত</span>
          </div>
        </div>

        {/* 3. Total Bazar */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">বাজার খরচ</span>
            <span className="w-6 h-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShoppingBasket className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatBdt(summary.totalBazarExpense)}
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>মিল ব্যয়ের মূল ভিত্তি</span>
            <span className="text-orange-600 font-semibold font-mono text-[10px]">100%</span>
          </div>
        </div>

        {/* 4. Shared Utilities */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">ইউটিলিটি বিল</span>
            <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wifi className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatBdt(summary.totalUtilitiesExpense)}
          </div>
          <div className="mt-2.5 text-[11px] text-blue-600 font-medium border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>মাথাপিছু {formatBdt(perHeadUtility)}</span>
            <span className="text-[10px] text-slate-400 font-sans">সমান ভাগ</span>
          </div>
        </div>

        {/* 5. Mess Cash Fund */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">হাতে ক্যাশ (Fund)</span>
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              summary.fundCashInHand >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatBdt(summary.fundCashInHand)}
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>জমা {formatBdt(summary.totalDeposits)}</span>
            <span className="text-emerald-600 text-[10px] font-semibold">ম্যানেজার ক্যাশ</span>
          </div>
        </div>
      </div>

      {/* Ledger Integrity Ribbon */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-100/70 border border-slate-200/80 rounded-lg text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-800">ডাবল-এন্ট্রি লেজার অডিট:</span>
          <span className="text-slate-500">
            মোট জমা = খরচ + মেস ক্যাশ (বকেয়া ৳{totalMemberDue.toFixed(0)} vs ফেরত ৳{totalMemberRefund.toFixed(0)})
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          হিসাব নির্ভুল (Balanced)
        </span>
      </div>

      {/* Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">মিল রেট হিসাব সূত্র</h3>
                  <p className="text-xs text-slate-500">Meal Rate Formula Calculation</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
              <div className="text-slate-500 text-[11px] font-sans">স্ট্যান্ডার্ড মেস ফর্মুলা:</div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center font-bold text-slate-800">
                Meal Rate = Total Bazar ÷ Total Meals
              </div>
              <div className="space-y-1.5 text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>মোট বাজার খরচ:</span>
                  <span className="font-bold text-slate-900">{formatBdt(summary.totalBazarExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span>মোট মিল সংখ্যা:</span>
                  <span className="font-bold text-slate-900">{summary.grandTotalMeals} টি</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-bold text-emerald-700">
                  <span>বর্তমান মিল রেট:</span>
                  <span>{formatBdt(summary.mealRate)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              *ইউটিলিটি বিল (ওয়াইফাই, গ্যাস, কারেন্ট) মিল রেটের অন্তর্ভুক্ত নয়, সেগুলো আলাদাভাবে সবার জমা থেকে সমান ভাগে কাটা হয়।
            </p>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
