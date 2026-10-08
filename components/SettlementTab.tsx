'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, Printer, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { MessOverallSummary, MemberCalculationSummary } from '@/lib/calculations';
import { formatBdt } from '@/lib/bengali-utils';
import { generateWhatsAppMessReport } from '@/lib/export-utils';

interface SettlementTabProps {
  monthYear: string;
  summary: MessOverallSummary;
}

export function SettlementTab({ monthYear, summary }: SettlementTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyWhatsApp = async () => {
    const reportText = generateWhatsAppMessReport(monthYear, summary);
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
      // Fallback
      alert('রিপোর্ট কপি করা হয়েছে:\n\n' + reportText);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              চূড়ান্ত হিসাব ও নিষ্পত্তি (Final Calculation & Settlements)
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              PDF Page 2 & 4
            </span>
          </div>
          <p className="text-xs text-slate-500">
            মিল খরচ + ইউটিলিটি শেয়ার বনাম জমা টাকার চূড়ান্ত ব্যালেন্স
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>কপি হয়েছে! (Copied)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপ রিপোর্ট কপি করুন</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Master Settlement Table (Direct representation of PDF Page 2 Final Calculation) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">সদস্য (Member)</th>
                <th className="py-3 px-3 text-center">মিল সংখ্যা</th>
                <th className="py-3 px-3 text-right">মিল খরচ (৳)</th>
                <th className="py-3 px-3 text-right">ইউটিলিটি শেয়ার (৳)</th>
                <th className="py-3 px-3 text-right bg-slate-100/50">মোট খরচ (৳)</th>
                <th className="py-3 px-3 text-right">মোট জমা (৳)</th>
                <th className="py-3 px-4 text-right bg-emerald-50/50 font-bold">
                  চূড়ান্ত ব্যালেন্স (Remaining)
                </th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.memberSummaries.map((m) => {
                const isRefund = m.status === 'refund';
                const isDue = m.status === 'due';
                const balanceAbs = Math.abs(m.balance);

                return (
                  <tr
                    key={m.member.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Member */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{m.member.name}</div>
                      {m.member.bnName && (
                        <div className="text-[10px] text-slate-400 font-normal">{m.member.bnName}</div>
                      )}
                    </td>

                    {/* Total Meals */}
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {m.totalMeals}
                    </td>

                    {/* Meal Cost */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatBdt(m.mealCost)}
                    </td>

                    {/* Utility Share */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatBdt(m.utilityShare)}
                    </td>

                    {/* Total Cost */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/40">
                      {formatBdt(m.totalCost)}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-800 font-medium">
                      {formatBdt(m.totalPaid)}
                      {m.outOfPocketUtilitiesPaid > 0 && (
                        <div className="text-[10px] text-blue-600">
                          (+{formatBdt(m.outOfPocketUtilitiesPaid)} বিল পরিশোধ)
                        </div>
                      )}
                    </td>

                    {/* Remaining Balance */}
                    <td
                      className={`py-3 px-4 text-right font-mono font-extrabold text-sm ${
                        isRefund
                          ? 'text-emerald-700 bg-emerald-50/60'
                          : isDue
                          ? 'text-rose-600 bg-rose-50/60'
                          : 'text-slate-600 bg-slate-50'
                      }`}
                    >
                      {isRefund && '+'}
                      {isDue && '-'}
                      {formatBdt(balanceAbs)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      {isRefund ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
                          <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                          মেস থেকে পাবে
                        </span>
                      ) : isDue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100/70 border border-rose-300 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          মেসে দিতে হবে
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          পরিশোধিত
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Member Settlement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {summary.memberSummaries.map((m) => {
          const isRefund = m.status === 'refund';
          const isDue = m.status === 'due';
          const balanceAbs = Math.abs(m.balance);

          return (
            <div
              key={m.member.id}
              className={`rounded-2xl p-4 border transition-all ${
                isRefund
                  ? 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200 shadow-xs'
                  : isDue
                  ? 'bg-gradient-to-br from-rose-50/50 to-white border-rose-200 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{m.member.name}</h4>
                  {m.member.bnName && (
                    <span className="text-xs text-slate-400">{m.member.bnName}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isRefund
                      ? 'bg-emerald-100 text-emerald-800'
                      : isDue
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isRefund ? 'ফেরত পাবে' : isDue ? 'বকেয়া' : 'সমান'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>মোট মিল:</span>
                  <span className="font-semibold text-slate-800">{m.totalMeals} টি</span>
                </div>
                <div className="flex justify-between">
                  <span>মিল খরচ:</span>
                  <span className="font-mono">{formatBdt(m.mealCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>শেয়ার্ড বিল:</span>
                  <span className="font-mono">{formatBdt(m.utilityShare)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                  <span>মোট খরচ:</span>
                  <span className="font-mono text-slate-900">{formatBdt(m.totalCost)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>মোট জমা/পরিশোধ:</span>
                  <span className="font-mono font-bold">{formatBdt(m.totalPaid)}</span>
                </div>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                  isRefund
                    ? 'border-emerald-200 text-emerald-800'
                    : isDue
                    ? 'border-rose-200 text-rose-800'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold">
                  {isRefund ? 'মেস থেকে পাবে:' : isDue ? 'মেসে জমা দিবে:' : 'ব্যালেন্স:'}
                </span>
                <span className="text-base font-extrabold font-mono">
                  {formatBdt(balanceAbs)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
