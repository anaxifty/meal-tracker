'use client';

import React, { useState } from 'react';
import { ShoppingBasket, Plus, Trash2, Calendar, User, Search, Filter } from 'lucide-react';
import { BazarExpense, Member } from '@/types/mess';
import { formatBdt } from '@/lib/bengali-utils';

interface BazarTabProps {
  bazarExpenses: BazarExpense[];
  members: Member[];
  onAddBazar: (bazar: Omit<BazarExpense, 'id'>) => void;
  onDeleteBazar: (id: string) => void;
}

export function BazarTab({ bazarExpenses, members, onAddBazar, onDeleteBazar }: BazarTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopperFilter, setSelectedShopperFilter] = useState('');
  const [date, setDate] = useState('2026-10-08');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState('');
  const [shopperId, setShopperId] = useState('');
  const [paidFrom, setPaidFrom] = useState<'fund' | 'shopper'>('fund');

  const totalBazar = bazarExpenses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  // Filtered bazar entries
  const filteredBazar = bazarExpenses
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((b) => {
      if (selectedShopperFilter && b.shopperId !== selectedShopperFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const shopper = members.find((m) => m.id === b.shopperId);
      const shopperNameMatch = shopper && (shopper.name.toLowerCase().includes(q) || (shopper.bnName && shopper.bnName.includes(q)));
      return b.items.toLowerCase().includes(q) || b.date.includes(q) || shopperNameMatch;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onAddBazar({
      date,
      amount: parsedAmount,
      items: items.trim() || 'Daily Bazar',
      shopperId: shopperId || undefined,
      paidFrom,
    });

    setAmount('');
    setItems('');
    setShopperId('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Add */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              দৈনিক বাজার খরচ (Daily Bazar Expenditures)
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
              PDF Page 3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            সব বাজার খরচের যোগফল মোট মিল দিয়ে ভাগ করে মিল রেট হিসাব করা হয়
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">মোট বাজার খরচ</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">{formatBdt(totalBazar)}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>বাজার খরচ লিখুন</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center flex-wrap gap-2.5 bg-white p-3 rounded-xl border border-slate-200/90">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="বাজারের আইটেম বা সদস্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedShopperFilter}
            onChange={(e) => setSelectedShopperFilter(e.target.value)}
            className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">সকল সদস্য (All Shoppers)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.bnName ? `(${m.bnName})` : ''}
              </option>
            ))}
          </select>
          {(searchQuery || selectedShopperFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedShopperFilter('');
              }}
              className="text-xs text-orange-600 hover:underline cursor-pointer"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Add Bazar Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBasket className="w-5 h-5 text-orange-600" />
              নতুন বাজার খরচ লিখুন
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">তারিখ (Date)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-orange-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">টাকার পরিমাণ (BDT ৳)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="যেমন: 850"
                  className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2.5 focus:border-orange-500 focus:outline-hidden text-slate-900 font-mono"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">বাজারের বিবরণ (Items)</label>
                <input
                  type="text"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  placeholder="যেমন: মুরগি, আলু, তেল, ডিম"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">বাজার করেছে</label>
                  <select
                    value={shopperId}
                    onChange={(e) => setShopperId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-orange-500 focus:outline-hidden"
                  >
                    <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.bnName ? `(${m.bnName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">টাকা কোথা থেকে দেওয়া</label>
                  <select
                    value={paidFrom}
                    onChange={(e) => setPaidFrom(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-orange-500 focus:outline-hidden"
                  >
                    <option value="fund">মেস ফান্ড থেকে</option>
                    <option value="shopper">সদস্যের নিজ পকেট থেকে</option>
                  </select>
                </div>
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
                  className="px-4 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-2xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bazar List Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {filteredBazar.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {searchQuery || selectedShopperFilter
              ? 'অনুসন্ধানের সাথে কোনো বাজার খরচ মেলেনি।'
              : 'এখনও কোন বাজার খরচ রেকর্ড করা হয়নি।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">বাজারের বিবরণ</th>
                  <th className="py-3 px-4">বাজার করেছে</th>
                  <th className="py-3 px-4">উৎস</th>
                  <th className="py-3 px-4 text-right">খরচ (টাকা)</th>
                  <th className="py-3 px-4 text-center w-16">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBazar.map((b) => {
                  const shopper = members.find((m) => m.id === b.shopperId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {b.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {b.items}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {shopper ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                            <User className="w-3 h-3 text-slate-400" />
                            {shopper.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            b.paidFrom === 'fund'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {b.paidFrom === 'fund' ? 'মেস ফান্ড' : 'ব্যক্তিগত টাকা'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono tabular-nums text-sm">
                        {formatBdt(b.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDeleteBazar(b.id)}
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
                    মোট বাজার খরচ ({filteredBazar.length} টি এন্ট্রি)
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-orange-700 text-sm font-mono tabular-nums">
                    {formatBdt(filteredBazar.reduce((s, b) => s + (Number(b.amount) || 0), 0))}
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
