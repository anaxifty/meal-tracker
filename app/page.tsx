'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SummaryStats } from '@/components/SummaryStats';
import { NaturalLanguageInput } from '@/components/NaturalLanguageInput';
import { ParsedActionModal } from '@/components/ParsedActionModal';
import { MealGrid } from '@/components/MealGrid';
import { BazarTab } from '@/components/BazarTab';
import { DepositsTab } from '@/components/DepositsTab';
import { UtilitiesTab } from '@/components/UtilitiesTab';
import { SettlementTab } from '@/components/SettlementTab';
import { MembersModal } from '@/components/MembersModal';
import {
  Member,
  MealRecord,
  BazarExpense,
  Deposit,
  UtilityExpense,
  ParsedItemResult,
  MessMonthState,
} from '@/types/mess';
import { getInitialState } from '@/lib/initial-data';
import { calculateMessSummary } from '@/lib/calculations';
import { Utensils, ShoppingBasket, Wallet, Wifi, FileCheck, CheckCircle2 } from 'lucide-react';
import { useIsMounted } from '@/hooks/use-mounted';

const STORAGE_KEY = 'messmeal_state_v1';

function loadStateFromStorage(month: string): MessMonthState {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${month}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.members && parsed.members.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  }
  return getInitialState(month);
}

export default function MainPage() {
  const isMounted = useIsMounted();
  const [monthYear, setMonthYear] = useState('2026-10');

  // Single consolidated or synchronized state
  const [appState, setAppState] = useState<MessMonthState>(() => loadStateFromStorage('2026-10'));

  // Destructure for easy access
  const { members, mealRecords, bazarExpenses, deposits, utilities } = appState;

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'meals' | 'bazar' | 'deposits' | 'utilities' | 'settlement'>('meals');

  // Modals & Popups
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [parsedModalData, setParsedModalData] = useState<{
    isOpen: boolean;
    rawInput: string;
    results: ParsedItemResult[];
  }>({
    isOpen: false,
    rawInput: '',
    results: [],
  });

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Persist state to localStorage whenever appState changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${monthYear}`, JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }, [monthYear, appState]);

  // Handle Month switch
  const handleMonthChange = (newMonthYear: string) => {
    setMonthYear(newMonthYear);
    setAppState(loadStateFromStorage(newMonthYear));
  };

  // Reset to Demo
  const handleResetDemo = () => {
    if (confirm('আপনি কি এই মাসের তথ্য রিসেট করে প্রাথমিক ডেমো ডেটা লোড করতে চান?')) {
      const initial = getInitialState(monthYear);
      setAppState(initial);
      showToast('ডেমো ডেটা সফলভাবে রিস্টোর হয়েছে!');
    }
  };

  // Live Summary Calculations
  const summary = calculateMessSummary(
    members,
    mealRecords,
    bazarExpenses,
    deposits,
    utilities
  );

  // Meal record handlers
  const handleUpdateMealRecord = (date: string, memberId: string, count: number) => {
    setAppState((prev) => {
      const records = [...prev.mealRecords];
      const existingIdx = records.findIndex((r) => r.date === date);
      if (existingIdx >= 0) {
        records[existingIdx] = {
          ...records[existingIdx],
          meals: {
            ...records[existingIdx].meals,
            [memberId]: Math.max(0, count),
          },
        };
      } else {
        records.push({
          date,
          meals: { [memberId]: Math.max(0, count) },
        });
      }
      return { ...prev, mealRecords: records };
    });
  };

  const handleSetDailyMeals = (date: string, meals: Record<string, number>, note?: string) => {
    setAppState((prev) => {
      const records = [...prev.mealRecords];
      const existingIdx = records.findIndex((r) => r.date === date);
      if (existingIdx >= 0) {
        records[existingIdx] = {
          ...records[existingIdx],
          meals: {
            ...records[existingIdx].meals,
            ...meals,
          },
          note: note || records[existingIdx].note,
        };
      } else {
        records.push({ date, meals, note });
      }
      return { ...prev, mealRecords: records };
    });
    showToast(`${date} তারিখের মিল সফলভাবে সংরক্ষিত হয়েছে!`);
  };

  const handleDeleteDateRecord = (date: string) => {
    setAppState((prev) => ({
      ...prev,
      mealRecords: prev.mealRecords.filter((r) => r.date !== date),
    }));
    showToast(`${date} তারিখের মিল রেকর্ড মুছে ফেলা হয়েছে`);
  };

  // Bazar handlers
  const handleAddBazar = (bazar: Omit<BazarExpense, 'id'>) => {
    const newBazar: BazarExpense = {
      ...bazar,
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setAppState((prev) => ({
      ...prev,
      bazarExpenses: [...prev.bazarExpenses, newBazar],
    }));
    showToast(`৳${bazar.amount} বাজার খরচ যোগ হয়েছে!`);
  };

  const handleDeleteBazar = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      bazarExpenses: prev.bazarExpenses.filter((b) => b.id !== id),
    }));
    showToast('বাজার খরচ মুছে ফেলা হয়েছে');
  };

  // Deposit handlers
  const handleAddDeposit = (deposit: Omit<Deposit, 'id'>) => {
    const newDeposit: Deposit = {
      ...deposit,
      id: `d-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setAppState((prev) => ({
      ...prev,
      deposits: [...prev.deposits, newDeposit],
    }));
    showToast(`৳${deposit.amount} জমা সফলভাবে যোগ হয়েছে!`);
  };

  const handleDeleteDeposit = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      deposits: prev.deposits.filter((d) => d.id !== id),
    }));
    showToast('জমার রেকর্ড মুছে ফেলা হয়েছে');
  };

  // Utility handlers
  const handleAddUtility = (utility: Omit<UtilityExpense, 'id'>) => {
    const newUtility: UtilityExpense = {
      ...utility,
      id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setAppState((prev) => ({
      ...prev,
      utilities: [...prev.utilities, newUtility],
    }));
    showToast(`৳${utility.amount} ${utility.title} যোগ হয়েছে!`);
  };

  const handleDeleteUtility = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      utilities: prev.utilities.filter((u) => u.id !== id),
    }));
    showToast('ইউটিলিটি বিল মুছে ফেলা হয়েছে');
  };

  // Member handlers
  const handleAddMember = (name: string, bnName?: string) => {
    const newMember: Member = {
      id: `m-${Date.now()}`,
      name,
      bnName,
      aliases: [name.toLowerCase(), bnName || ''].filter(Boolean),
      active: true,
    };
    setAppState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
    showToast(`নতুন সদস্য "${name}" যুক্ত হয়েছে!`);
  };

  const handleUpdateMember = (id: string, name: string, bnName?: string, active = true) => {
    setAppState((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === id
          ? {
              ...m,
              name,
              bnName,
              active,
              aliases: [
                name.toLowerCase(),
                bnName || '',
                ...m.aliases.filter(
                  (a) => a !== m.name.toLowerCase() && a !== (m.bnName || '')
                ),
              ].filter(Boolean),
            }
          : m
      ),
    }));
    showToast('সদস্যের তথ্য আপডেট হয়েছে');
  };

  const handleDeleteMember = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
    showToast('সদস্য মুছে ফেলা হয়েছে');
  };

  // Natural Language Parsed Results Handler
  const handleParsedResults = (results: ParsedItemResult[], rawInput: string) => {
    setParsedModalData({
      isOpen: true,
      rawInput,
      results,
    });
  };

  // Apply parsed actions from confirmation modal
  const handleConfirmApplyParsed = (items: ParsedItemResult[]) => {
    let mealsUpdatedCount = 0;
    let depositsAddedCount = 0;
    let bazarAddedCount = 0;
    let utilitiesAddedCount = 0;

    for (const item of items) {
      if (item.type === 'meals' && item.data.mealEntries) {
        const date = item.data.date || new Date().toISOString().split('T')[0];
        const mealsMap: Record<string, number> = {};
        for (const entry of item.data.mealEntries) {
          mealsMap[entry.memberId] = entry.count;
        }
        handleSetDailyMeals(date, mealsMap, 'Added via Natural Language');
        mealsUpdatedCount++;
      } else if (item.type === 'deposit' && item.data.deposit) {
        const d = item.data.deposit;
        handleAddDeposit({
          memberId: d.memberId,
          amount: d.amount,
          date: item.data.date || new Date().toISOString().split('T')[0],
          method: d.method || 'Cash',
          note: d.note || 'Added via Natural Language',
        });
        depositsAddedCount++;
      } else if (item.type === 'bazar' && item.data.bazar) {
        const b = item.data.bazar;
        handleAddBazar({
          amount: b.amount,
          items: b.items || 'Daily Bazar',
          date: item.data.date || new Date().toISOString().split('T')[0],
          shopperId: b.shopperId,
          paidFrom: b.paidFrom || 'fund',
        });
        bazarAddedCount++;
      } else if (item.type === 'utility' && item.data.utility) {
        const u = item.data.utility;
        handleAddUtility({
          category: u.category || 'other',
          title: u.title || 'Shared Utility',
          amount: u.amount,
          date: item.data.date || new Date().toISOString().split('T')[0],
          paidById: u.paidById,
          paidFrom: u.paidFrom || 'fund',
          splitAmongMemberIds: members.filter((m) => m.active).map((m) => m.id),
        });
        utilitiesAddedCount++;
      }
    }

    setParsedModalData({ isOpen: false, rawInput: '', results: [] });
    showToast(
      `সফলভাবে প্রয়োগ করা হয়েছে! (${[
        mealsUpdatedCount ? `${mealsUpdatedCount} মিল শিট` : '',
        depositsAddedCount ? `${depositsAddedCount} জমা` : '',
        bazarAddedCount ? `${bazarAddedCount} বাজার` : '',
        utilitiesAddedCount ? `${utilitiesAddedCount} ইউটিলিটি` : '',
      ]
        .filter(Boolean)
        .join(', ')})`
    );
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 animate-pulse">
            <Utensils className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">MessMeal লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        monthYear={monthYear}
        onMonthChange={handleMonthChange}
        members={members}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Natural Language Input Bar */}
        <NaturalLanguageInput
          members={members}
          onParsedResults={handleParsedResults}
        />

        {/* Live Calculation Metric Cards */}
        <SummaryStats
          summary={summary}
          memberCount={members.filter((m) => m.active).length}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 mb-5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('meals')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'meals'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>১. মিল রেকর্ড (Meal Sheet)</span>
          </button>

          <button
            onClick={() => setActiveTab('bazar')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'bazar'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBasket className="w-3.5 h-3.5" />
            <span>২. বাজার খরচ ({bazarExpenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'deposits'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>৩. জমা টাকা ({deposits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('utilities')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'utilities'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>৪. শেয়ার্ড বিল (Wifi, Gas, Current)</span>
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settlement'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>৫. চূড়ান্ত হিসাব ও রিপোর্ট (Settlements)</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'meals' && (
          <MealGrid
            monthYear={monthYear}
            members={members}
            mealRecords={mealRecords}
            mealRate={summary.mealRate}
            totalBazarExpense={summary.totalBazarExpense}
            onUpdateMealRecord={handleUpdateMealRecord}
            onSetDailyMeals={handleSetDailyMeals}
            onDeleteDateRecord={handleDeleteDateRecord}
          />
        )}

        {activeTab === 'bazar' && (
          <BazarTab
            bazarExpenses={bazarExpenses}
            members={members}
            onAddBazar={handleAddBazar}
            onDeleteBazar={handleDeleteBazar}
          />
        )}

        {activeTab === 'deposits' && (
          <DepositsTab
            deposits={deposits}
            members={members}
            onAddDeposit={handleAddDeposit}
            onDeleteDeposit={handleDeleteDeposit}
          />
        )}

        {activeTab === 'utilities' && (
          <UtilitiesTab
            utilities={utilities}
            members={members}
            onAddUtility={handleAddUtility}
            onDeleteUtility={handleDeleteUtility}
          />
        )}

        {activeTab === 'settlement' && (
          <SettlementTab
            monthYear={monthYear}
            summary={summary}
          />
        )}
      </main>

      {/* Confirmation Modal for Parsed Natural Language Results */}
      <ParsedActionModal
        isOpen={parsedModalData.isOpen}
        onClose={() => setParsedModalData({ isOpen: false, rawInput: '', results: [] })}
        rawInput={parsedModalData.rawInput}
        results={parsedModalData.results}
        members={members}
        onConfirmApply={handleConfirmApplyParsed}
      />

      {/* Members Management Modal */}
      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
}
