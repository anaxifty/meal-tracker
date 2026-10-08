'use client';

import React, { useState } from 'react';
import { CheckCircle2, X, Utensils, Wallet, Wifi, ShoppingBasket, AlertCircle } from 'lucide-react';
import { ParsedItemResult, Member } from '@/types/mess';
import { formatBdt } from '@/lib/bengali-utils';

interface ParsedActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawInput: string;
  results: ParsedItemResult[];
  members: Member[];
  onConfirmApply: (results: ParsedItemResult[]) => void;
}

export function ParsedActionModal({
  isOpen,
  onClose,
  rawInput,
  results: initialResults,
  members,
  onConfirmApply,
}: ParsedActionModalProps) {
  const [prevResults, setPrevResults] = useState<ParsedItemResult[]>(initialResults);
  const [editableResults, setEditableResults] = useState<ParsedItemResult[]>(initialResults);

  // Sync state if initialResults changes without useEffect
  if (initialResults !== prevResults) {
    setPrevResults(initialResults);
    setEditableResults(initialResults);
  }

  if (!isOpen || editableResults.length === 0) return null;

  const handleMealCountChange = (resultIdx: number, memberIdx: number, newCount: number) => {
    setEditableResults((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy[resultIdx]?.data?.mealEntries?.[memberIdx]) {
        copy[resultIdx].data.mealEntries[memberIdx].count = Math.max(0, newCount);
      }
      return copy;
    });
  };

  const handleDepositChange = (resultIdx: number, field: string, val: any) => {
    setEditableResults((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy[resultIdx]?.data?.deposit) {
        copy[resultIdx].data.deposit[field] = val;
      }
      return copy;
    });
  };

  const handleUtilityChange = (resultIdx: number, field: string, val: any) => {
    setEditableResults((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy[resultIdx]?.data?.utility) {
        copy[resultIdx].data.utility[field] = val;
      }
      return copy;
    });
  };

  const handleBazarChange = (resultIdx: number, field: string, val: any) => {
    setEditableResults((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy[resultIdx]?.data?.bazar) {
        copy[resultIdx].data.bazar[field] = val;
      }
      return copy;
    });
  };

  const handleRemoveResult = (idx: number) => {
    setEditableResults((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                শনাক্তকৃত হিসাব নিশ্চিত করুন
              </h3>
              <p className="text-xs text-slate-500">
                Review parsed items before applying to records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list of parsed actions */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {editableResults.map((item, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-colors relative"
            >
              <button
                type="button"
                onClick={() => handleRemoveResult(idx)}
                title="Discard this item"
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 p-1"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Meals Action */}
              {item.type === 'meals' && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Utensils className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold uppercase text-amber-800">
                      দৈনিক মিল রেকর্ড
                    </span>
                    <span className="text-xs text-slate-500 ml-auto mr-6 font-mono font-medium">
                      তারিখ: {item.data.date || 'Today'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">{item.summary}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {item.data.mealEntries?.map((me, mIdx) => (
                      <div key={me.memberId} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[70px]">
                          {me.memberName}
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={me.count}
                          onChange={(e) =>
                            handleMealCountChange(idx, mIdx, parseFloat(e.target.value) || 0)
                          }
                          className="w-12 text-right font-bold text-emerald-700 border-b border-slate-300 focus:outline-hidden focus:border-emerald-600 px-1 py-0.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deposit Action */}
              {item.type === 'deposit' && item.data.deposit && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold uppercase text-emerald-800">
                      টাকা জমা (Deposit)
                    </span>
                    <span className="text-xs text-slate-500 ml-auto mr-6 font-mono font-medium">
                      তারিখ: {item.data.date || 'Today'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">সদস্য</label>
                      <select
                        value={item.data.deposit.memberId}
                        onChange={(e) => {
                          const m = members.find((mem) => mem.id === e.target.value);
                          handleDepositChange(idx, 'memberId', e.target.value);
                          if (m) handleDepositChange(idx, 'memberName', m.name);
                        }}
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.bnName ? `(${m.bnName})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">জমার পরিমাণ (BDT)</label>
                      <input
                        type="number"
                        value={item.data.deposit.amount}
                        onChange={(e) => handleDepositChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-800 border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Utility Action */}
              {item.type === 'utility' && item.data.utility && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Wifi className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold uppercase text-blue-800">
                      শেয়ার্ড ইউটিলিটি বিল
                    </span>
                    <span className="text-xs text-slate-500 ml-auto mr-6 font-mono font-medium">
                      তারিখ: {item.data.date || 'Today'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">বিল ক্যাটাগরি</label>
                      <select
                        value={item.data.utility.category}
                        onChange={(e) => {
                          const cat = e.target.value as any;
                          handleUtilityChange(idx, 'category', cat);
                          const titleMap: any = { wifi: 'Wifi Bill', gas: 'Gas Bill', current: 'Current Bill', other: 'Other' };
                          handleUtilityChange(idx, 'title', titleMap[cat] || 'Shared Bill');
                        }}
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50"
                      >
                        <option value="wifi">ওয়াইফাই বিল (Wifi)</option>
                        <option value="gas">গ্যাস সিলিন্ডার (Gas)</option>
                        <option value="current">কারেন্ট বিল (Current)</option>
                        <option value="other">অন্যান্য (Other)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">মোট বিল (BDT)</label>
                      <input
                        type="number"
                        value={item.data.utility.amount}
                        onChange={(e) => handleUtilityChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-800 border border-slate-200 rounded-lg p-2 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">বিল পরিশোধ করেছে</label>
                      <select
                        value={item.data.utility.paidById || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUtilityChange(idx, 'paidById', val || undefined);
                          handleUtilityChange(idx, 'paidFrom', val ? 'member' : 'fund');
                        }}
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50"
                      >
                        <option value="">মেস ফান্ড থেকে (Mess Fund)</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} (নিজ পকেট থেকে)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Bazar Action */}
              {item.type === 'bazar' && item.data.bazar && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center">
                      <ShoppingBasket className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold uppercase text-orange-800">
                      দৈনিক বাজার খরচ
                    </span>
                    <span className="text-xs text-slate-500 ml-auto mr-6 font-mono font-medium">
                      তারিখ: {item.data.date || 'Today'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">টাকার পরিমাণ (BDT)</label>
                      <input
                        type="number"
                        value={item.data.bazar.amount}
                        onChange={(e) => handleBazarChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-800 border border-slate-200 rounded-lg p-2 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">বাজারের বিবরণ</label>
                      <input
                        type="text"
                        value={item.data.bazar.items}
                        onChange={(e) => handleBazarChange(idx, 'items', e.target.value)}
                        className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-lg p-2 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">বাজার করেছে</label>
                      <select
                        value={item.data.bazar.shopperId || ''}
                        onChange={(e) => handleBazarChange(idx, 'shopperId', e.target.value || undefined)}
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50"
                      >
                        <option value="">মেসের হয়ে (Anyone)</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            বাতিল করুন (Cancel)
          </button>
          <button
            type="button"
            onClick={() => onConfirmApply(editableResults)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>নিশ্চিত ও যুক্ত করুন (Apply to Records)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
