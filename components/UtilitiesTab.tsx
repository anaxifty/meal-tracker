'use client';

import React, { useState } from 'react';
import { Wifi, Flame, Zap, Plus, Trash2, Calendar, UserCheck, ShieldAlert } from 'lucide-react';
import { UtilityExpense, Member } from '@/types/mess';
import { formatBdt } from '@/lib/bengali-utils';

interface UtilitiesTabProps {
  utilities: UtilityExpense[];
  members: Member[];
  onAddUtility: (utility: Omit<UtilityExpense, 'id'>) => void;
  onDeleteUtility: (id: string) => void;
}

export function UtilitiesTab({
  utilities,
  members,
  onAddUtility,
  onDeleteUtility,
}: UtilitiesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<'wifi' | 'current' | 'gas' | 'other'>('wifi');
  const [title, setTitle] = useState('Wifi Bill');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-08');
  const [paidById, setPaidById] = useState<string>('');
  const [paidFrom, setPaidFrom] = useState<'fund' | 'member'>('fund');

  const activeMembers = members.filter((m) => m.active);
  const totalUtilities = utilities.reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  const perHeadAvg = activeMembers.length > 0 ? totalUtilities / activeMembers.length : 0;

  const handleCategorySelect = (cat: 'wifi' | 'current' | 'gas' | 'other') => {
    setCategory(cat);
    const defaults: Record<string, string> = {
      wifi: 'Wifi Bill (ইন্টারনেট বিল)',
      gas: 'Gas Cylinder (গ্যাস সিলিন্ডার)',
      current: 'Current Bill (বিদ্যুৎ বিল)',
      other: 'অন্যান্য শেয়ার্ড খরচ',
    };
    setTitle(defaults[cat]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onAddUtility({
      category,
      title: title.trim() || 'Shared Utility',
      amount: parsedAmount,
      date,
      paidById: paidById || undefined,
      paidFrom: paidById ? 'member' : 'fund',
      splitAmongMemberIds: activeMembers.map((m) => m.id),
    });

    setAmount('');
    setPaidById('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'wifi':
        return <Wifi className="w-4 h-4 text-sky-500" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'current':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Wifi className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              শেয়ার্ড ইউটিলিটি বিল (Wifi, Gas & Electricity)
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              সমান ভাগে বণ্টন
            </span>
          </div>
          <p className="text-xs text-slate-500">
            এই বিলগুলো মিল রেটের বাইরে সবার জমার টাকা থেকে সমান ভাগে বিয়োগ হয়
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">মাথাপিছু শেয়ার</span>
            <span className="text-lg font-bold text-blue-700">{formatBdt(perHeadAvg)}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বিল লিখুন</span>
          </button>
        </div>
      </div>

      {/* Add Utility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              শেয়ার্ড ইউটিলিটি বিল যুক্ত করুন
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">বিলের ধরন</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('wifi')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      category === 'wifi'
                        ? 'border-sky-500 bg-sky-50 text-sky-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" /> Wifi বিল
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('gas')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      category === 'gas'
                        ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" /> গ্যাস সিলিন্ডার
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('current')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      category === 'current'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> কারেন্ট বিল
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">বিলের শিরোনাম</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">মোট বিলের টাকা (BDT ৳)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="যেমন: 750"
                    className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-hidden text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  কে পরিশোধ করেছে? (Who Paid?)
                </label>
                <select
                  value={paidById}
                  onChange={(e) => setPaidById(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="">মেসের যৌথ ফান্ড থেকে (Mess Fund)</option>
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.bnName ? `(${m.bnName})` : ''} - নিজের পকেট থেকে
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  *যদি কোনো সদস্য নিজের পকেট থেকে দেয় (যেমন: ইফতি ৭৫০ টাকা ওয়াইফাই দিল), তবে তার একাউন্টে এই টাকা ক্রেডিট হবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Utilities Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {utilities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            এখনও কোন ইউটিলিটি বিল যোগ করা হয়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">বিলের বিবরণ</th>
                  <th className="py-3 px-4">কে পরিশোধ করেছে</th>
                  <th className="py-3 px-4 text-center">মাথাপিছু শেয়ার ({activeMembers.length} জন)</th>
                  <th className="py-3 px-4 text-right">মোট বিল</th>
                  <th className="py-3 px-4 text-center w-16">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {utilities.map((u) => {
                  const payer = members.find((m) => m.id === u.paidById);
                  const share = activeMembers.length > 0 ? u.amount / activeMembers.length : 0;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {u.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-slate-100">{getCategoryIcon(u.category)}</span>
                          <span>{u.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {payer ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium text-[11px]">
                            <UserCheck className="w-3 h-3" />
                            {payer.name} (নিজ পকেট থেকে)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium text-[11px]">
                            মেস ফান্ড থেকে
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                        {formatBdt(share)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700 font-mono text-sm">
                        {formatBdt(u.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDeleteUtility(u.id)}
                          title="মুছুন"
                          className="p-1 rounded-md text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-700 uppercase">
                    মোট ইউটিলিটি বিল (Total Utilities)
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-800 font-mono">
                    {formatBdt(perHeadAvg)} / মাথা
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-blue-800 text-sm font-mono">
                    {formatBdt(totalUtilities)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
