'use client';

import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Calendar, User, CreditCard, Search } from 'lucide-react';
import { Deposit, Member } from '@/types/mess';
import { formatBdt } from '@/lib/bengali-utils';

interface DepositsTabProps {
  deposits: Deposit[];
  members: Member[];
  onAddDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  onDeleteDeposit: (id: string) => void;
}

export function DepositsTab({ deposits, members, onAddDeposit, onDeleteDeposit }: DepositsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-08');
  const [method, setMethod] = useState('bKash');
  const [note, setNote] = useState('');

  const activeMembers = members.filter((m) => m.active);

  // Per-member total deposits map
  const memberDepositTotals: Record<string, number> = {};
  activeMembers.forEach((m) => {
    memberDepositTotals[m.id] = 0;
  });

  deposits.forEach((d) => {
    if (memberDepositTotals[d.memberId] !== undefined) {
      memberDepositTotals[d.memberId] += Number(d.amount) || 0;
    }
  });

  const grandTotalDeposits = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const filteredDeposits = deposits
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((d) => {
      if (selectedMemberFilter && d.memberId !== selectedMemberFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const member = members.find((m) => m.id === d.memberId);
      const nameMatch = member && (member.name.toLowerCase().includes(q) || (member.bnName && member.bnName.includes(q)));
      const noteMatch = d.note && d.note.toLowerCase().includes(q);
      const methodMatch = d.method && d.method.toLowerCase().includes(q);
      return nameMatch || noteMatch || methodMatch || d.date.includes(q);
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !memberId) return;

    onAddDeposit({
      memberId,
      amount: parsedAmount,
      date,
      method,
      note: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Add */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              সদস্যদের জমা হিসাব (Member Deposits)
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
              PDF Page 2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            মেসের ফান্ডে অগ্রিম জমা হওয়া টাকার হিসাব
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">মোট জমা সংগ্রহ</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">{formatBdt(grandTotalDeposits)}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>জমা টাকা লিখুন</span>
          </button>
        </div>
      </div>

      {/* Member Deposit Summary Grid (like top of Page 2 in PDF) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {activeMembers.map((m) => {
          const total = memberDepositTotals[m.id] || 0;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedMemberFilter(selectedMemberFilter === m.id ? '' : m.id)}
              className={`bg-white border rounded-xl p-3 text-center shadow-2xs transition-all cursor-pointer ${
                selectedMemberFilter === m.id
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-800 truncate">{m.name}</div>
              {m.bnName && <div className="text-[10px] text-slate-400">{m.bnName}</div>}
              <div className="mt-1 text-sm font-extrabold text-emerald-700 font-mono tabular-nums">
                {formatBdt(total)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search / Filter Bar */}
      <div className="flex items-center flex-wrap gap-2.5 bg-white p-3 rounded-xl border border-slate-200/90">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="সদস্যের নাম বা জমার মন্তব্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMemberFilter}
            onChange={(e) => setSelectedMemberFilter(e.target.value)}
            className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">সকল সদস্য (All Members)</option>
            {activeMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.bnName ? `(${m.bnName})` : ''}
              </option>
            ))}
          </select>
          {(searchQuery || selectedMemberFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMemberFilter('');
              }}
              className="text-xs text-emerald-600 hover:underline cursor-pointer"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Add Deposit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              সদস্যের জমা যুক্ত করুন
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">সদস্য নির্বাচন করুন</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden"
                  required
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.bnName ? `(${m.bnName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">টাকার পরিমাণ (BDT ৳)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="যেমন: 2000"
                  className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden text-slate-900 font-mono tabular-nums"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">পদ্ধতি</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Cash">নগদ ক্যাশ (Cash)</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">নোট / বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: ১০০০ টাকা যোগ হলো"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden"
                />
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
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposits Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {filteredDeposits.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {searchQuery || selectedMemberFilter ? 'কোনো জমার রেকর্ড মেলেনি।' : 'এখনও কোন জমার রেকর্ড নেই।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">সদস্যের নাম</th>
                  <th className="py-3 px-4">পদ্ধতি</th>
                  <th className="py-3 px-4">মন্তব্য</th>
                  <th className="py-3 px-4 text-right">জমার পরিমাণ</th>
                  <th className="py-3 px-4 text-center w-16">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeposits.map((d) => {
                  const member = members.find((m) => m.id === d.memberId);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {d.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {member ? member.name : 'Unknown'}
                        {member?.bnName && (
                          <span className="text-slate-400 font-normal ml-1">({member.bnName})</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {d.method || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {d.note || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono tabular-nums text-sm">
                        {formatBdt(d.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDeleteDeposit(d.id)}
                          title="মুছুন"
                          className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors"
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
                  <td colSpan={4} className="py-3 px-4 text-slate-700 uppercase">
                    মোট জমা ({filteredDeposits.length} টি এন্ট্রি)
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-800 text-sm font-mono tabular-nums">
                    {formatBdt(filteredDeposits.reduce((s, d) => s + (Number(d.amount) || 0), 0))}
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
