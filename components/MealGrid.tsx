'use client';

import React, { useState } from 'react';
import { Member, MealRecord } from '@/types/mess';
import { formatBdt } from '@/lib/bengali-utils';
import { Plus, Minus, Calendar, Edit3, Check, Trash2 } from 'lucide-react';

interface MealGridProps {
  monthYear: string;
  members: Member[];
  mealRecords: MealRecord[];
  mealRate: number;
  totalBazarExpense: number;
  onUpdateMealRecord: (date: string, memberId: string, count: number) => void;
  onSetDailyMeals: (date: string, meals: Record<string, number>, note?: string) => void;
  onDeleteDateRecord: (date: string) => void;
}

const BANGLA_WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MealGrid({
  monthYear,
  members,
  mealRecords,
  mealRate,
  totalBazarExpense,
  onUpdateMealRecord,
  onSetDailyMeals,
  onDeleteDateRecord,
}: MealGridProps) {
  const [editingCell, setEditingCell] = useState<{ date: string; memberId: string } | null>(null);
  const [quickDate, setQuickDate] = useState<string>(`${monthYear}-08`);
  const [quickDefaultCount, setQuickDefaultCount] = useState<number>(2);

  const activeMembers = members.filter((m) => m.active);

  // Generate days for the month (1..31)
  const [yearStr, monthStr] = monthYear.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const allDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPad = String(d).padStart(2, '0');
    allDates.push(`${monthYear}-${dayPad}`);
  }

  // Map existing records by date
  const recordsByDate = new Map<string, MealRecord>();
  mealRecords.forEach((r) => {
    recordsByDate.set(r.date, r);
  });

  // Calculate totals per member
  const memberTotals: Record<string, number> = {};
  activeMembers.forEach((m) => {
    memberTotals[m.id] = 0;
  });

  let grandTotalMeals = 0;
  mealRecords.forEach((r) => {
    activeMembers.forEach((m) => {
      const count = Number(r.meals[m.id]) || 0;
      memberTotals[m.id] += count;
      grandTotalMeals += count;
    });
  });

  const handleQuickAddDate = () => {
    const meals: Record<string, number> = {};
    activeMembers.forEach((m) => {
      meals[m.id] = quickDefaultCount;
    });
    onSetDailyMeals(quickDate, meals, 'Quick Added');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              মিল রেকর্ড শিট (Daily Meal Records)
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              PDF Page 1 Format
            </span>
          </div>
          <p className="text-xs text-slate-500">
            প্রতিটি সদস্যের দৈনিক মিল সংখ্যা এডিট করতে সেলে ক্লিক করুন বা বাটনে চাপ দিন
          </p>
        </div>

        {/* Quick Day Autofill */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="outline-hidden text-slate-700 font-medium cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-500">সবাই:</span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={quickDefaultCount}
              onChange={(e) => setQuickDefaultCount(parseFloat(e.target.value) || 0)}
              className="w-10 text-center font-bold text-slate-800 border-b border-slate-300 focus:outline-hidden"
            />
            <span className="text-slate-500">মিল</span>
          </div>
          <button
            onClick={handleQuickAddDate}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>তারিখ পূরণ করুন</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto max-h-[580px] relative">
        <table className="w-full text-xs text-left border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs">
            <tr>
              <th className="py-2.5 px-3 font-semibold border-r border-slate-200 min-w-[90px] bg-slate-100 sticky left-0 z-20">
                তারিখ (Date)
              </th>
              <th className="py-2.5 px-2 font-medium border-r border-slate-200 text-center w-12 text-slate-500">
                বার
              </th>
              {activeMembers.map((m) => (
                <th
                  key={m.id}
                  className="py-2.5 px-3 font-semibold text-center border-r border-slate-200 min-w-[85px] bg-sky-50/70 text-slate-800"
                >
                  <div className="font-bold">{m.name}</div>
                  {m.bnName && <div className="text-[10px] text-slate-500 font-normal">{m.bnName}</div>}
                </th>
              ))}
              <th className="py-2.5 px-3 font-semibold text-center border-r border-slate-200 min-w-[70px] bg-amber-50 text-amber-900">
                মোট মিল
              </th>
              <th className="py-2.5 px-2 font-normal text-center w-10 text-slate-400">
                একশন
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80">
            {allDates.map((dateStr) => {
              const record = recordsByDate.get(dateStr);
              const [yStr, mStr, dStr] = dateStr.split('-');
              const dateObj = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
              const dayName = BANGLA_WEEKDAYS[dateObj.getDay()];
              const monthShort = MONTH_NAMES[Number(mStr) - 1];
              const dayNumber = dStr;
              const isToday = dateStr === `${monthYear}-08`;

              // Daily total
              let dayTotal = 0;
              if (record) {
                activeMembers.forEach((m) => {
                  dayTotal += Number(record.meals[m.id]) || 0;
                });
              }

              return (
                <tr
                  key={dateStr}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isToday ? 'bg-emerald-50/40 font-medium' : ''
                  }`}
                >
                  {/* Date Column (Sticky) */}
                  <td
                    className={`py-2 px-3 border-r border-slate-200 font-mono text-slate-700 whitespace-nowrap sticky left-0 z-10 ${
                      isToday ? 'bg-emerald-100/60 font-bold text-emerald-900' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{dayNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        {monthShort}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>
                  </td>

                  {/* Day of Week */}
                  <td className="py-2 px-1 text-center border-r border-slate-200 text-slate-400 text-[11px]">
                    {dayName}
                  </td>

                  {/* Member Meal Cells */}
                  {activeMembers.map((m) => {
                    const count = record?.meals?.[m.id] ?? 0;
                    const isCellEditing =
                      editingCell?.date === dateStr && editingCell?.memberId === m.id;

                    return (
                      <td
                        key={m.id}
                        className={`py-1 px-1.5 text-center border-r border-slate-200 ${
                          count > 0 ? 'bg-emerald-50/25' : 'text-slate-300'
                        }`}
                      >
                        {isCellEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              autoFocus
                              defaultValue={count}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                onUpdateMealRecord(dateStr, m.id, val);
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseFloat((e.target as any).value) || 0;
                                  onUpdateMealRecord(dateStr, m.id, val);
                                  setEditingCell(null);
                                }
                              }}
                              className="w-12 text-center font-bold text-emerald-800 bg-white border border-emerald-400 rounded-sm py-0.5 text-xs outline-hidden"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingCell({ date: dateStr, memberId: m.id })}
                            className="group flex items-center justify-center gap-1 py-1 px-1 rounded-sm cursor-pointer hover:bg-emerald-100/50"
                          >
                            <span
                              className={`font-semibold ${
                                count > 0 ? 'text-slate-900' : 'text-slate-300'
                              }`}
                            >
                              {count}
                            </span>
                            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                              <button
                                type="button"
                                title="+0.5 meal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateMealRecord(dateStr, m.id, count + 0.5);
                                }}
                                className="w-3.5 h-3.5 rounded-xs bg-slate-200 text-slate-700 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-[10px]"
                              >
                                +
                              </button>
                              {count > 0 && (
                                <button
                                  type="button"
                                  title="-0.5 meal"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateMealRecord(dateStr, m.id, Math.max(0, count - 0.5));
                                  }}
                                  className="w-3.5 h-3.5 rounded-xs bg-slate-200 text-slate-700 hover:bg-rose-500 hover:text-white flex items-center justify-center text-[10px]"
                                >
                                  -
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Day Total */}
                  <td className="py-2 px-3 text-center border-r border-slate-200 font-bold bg-amber-50/50 text-slate-800">
                    {dayTotal > 0 ? dayTotal : '-'}
                  </td>

                  {/* Delete Date Button */}
                  <td className="py-2 px-1 text-center">
                    {record && (
                      <button
                        onClick={() => onDeleteDateRecord(dateStr)}
                        title="Clear this date record"
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Summaries directly reflecting Page 1 of PDF */}
          <tfoot className="sticky bottom-0 z-20 bg-slate-50 border-t-2 border-slate-300 font-semibold shadow-md">
            {/* 1. Total Meal per member */}
            <tr className="bg-sky-50 text-slate-800">
              <td
                colSpan={2}
                className="py-2.5 px-3 border-r border-slate-300 font-bold text-sky-950 uppercase tracking-wider sticky left-0 z-20 bg-sky-50"
              >
                Total Meal (মোট মিল)
              </td>
              {activeMembers.map((m) => (
                <td
                  key={m.id}
                  className="py-2.5 px-2 text-center border-r border-slate-300 font-extrabold text-sky-900 text-sm"
                >
                  {memberTotals[m.id]}
                </td>
              ))}
              <td className="py-2.5 px-2 text-center border-r border-slate-300 font-extrabold text-amber-900 bg-amber-100 text-sm">
                {grandTotalMeals}
              </td>
              <td></td>
            </tr>

            {/* 2. Total cost per consumer = Meal Rate × Number of Total meal per consumer */}
            <tr className="bg-rose-50/60 text-slate-800 border-t border-slate-200">
              <td
                colSpan={2}
                className="py-2.5 px-3 border-r border-slate-300 font-bold text-rose-950 text-[11px] sticky left-0 z-20 bg-rose-50/60"
              >
                <div>মিল খরচ (Meal Cost)</div>
                <div className="text-[10px] text-slate-500 font-normal">
                  = Meal Rate ({formatBdt(mealRate)}) × Meals
                </div>
              </td>
              {activeMembers.map((m) => {
                const cost = memberTotals[m.id] * mealRate;
                return (
                  <td
                    key={m.id}
                    className="py-2.5 px-2 text-center border-r border-slate-300 font-bold text-rose-700 font-mono"
                  >
                    {formatBdt(cost)}
                  </td>
                );
              })}
              <td className="py-2.5 px-2 text-center border-r border-slate-300 font-bold text-slate-800 bg-amber-50/70">
                {formatBdt(totalBazarExpense)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
