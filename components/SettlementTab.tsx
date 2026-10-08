'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, Printer, Download, ArrowUpRight, ArrowDownRight, FileText, CheckCircle2 } from 'lucide-react';
import { MessOverallSummary, MemberCalculationSummary } from '@/lib/calculations';
import { formatBdt } from '@/lib/bengali-utils';
import { generateWhatsAppMessReport, exportMessToCsv } from '@/lib/export-utils';

interface SettlementTabProps {
  monthYear: string;
  summary: MessOverallSummary;
}

export function SettlementTab({ monthYear, summary }: SettlementTabProps) {
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [reportFormat, setReportFormat] = useState<'bangla' | 'compact'>('bangla');

  const handleCopyWhatsApp = async (style: 'bangla' | 'compact') => {
    const reportText = generateWhatsAppMessReport(monthYear, summary, style);
    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedStyle(style);
      setTimeout(() => setCopiedStyle(null), 2500);
    } catch (e) {
      console.error(e);
      alert('রিপোর্ট কপি করা হয়েছে:\n\n' + reportText);
    }
  };

  const handleDownloadCsv = () => {
    exportMessToCsv(monthYear, summary);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              চূড়ান্ত হিসাব ও নিষ্পত্তি (Final Settlements)
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
              PDF Page 2 & 4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            সদস্যভিত্তিক মিল খরচ ও ইউটিলিটি সমন্বয় করে চূড়ান্ত পাওনা/বকেয়া ব্যালেন্স
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Copy WhatsApp */}
          <button
            onClick={() => handleCopyWhatsApp('bangla')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            {copiedStyle === 'bangla' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>হোয়াটসঅ্যাপ রিপোর্ট</span>
              </>
            )}
          </button>

          {/* Copy Compact */}
          <button
            onClick={() => handleCopyWhatsApp('compact')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="সংক্ষিপ্ত ফরম্যাটে কপি করুন"
          >
            {copiedStyle === 'compact' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>সংক্ষিপ্ত কপি!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>সংক্ষিপ্ত তালিকা</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Excel / Google Sheets CSV ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV এক্সপোর্ট</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* Master Settlement Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">সদস্য (Member)</th>
                <th className="py-3 px-3 text-center">মিল</th>
                <th className="py-3 px-3 text-right">মিল খরচ</th>
                <th className="py-3 px-3 text-right">শেয়ার্ড বিল</th>
                <th className="py-3 px-3 text-right bg-slate-100/50">মোট খরচ</th>
                <th className="py-3 px-3 text-right">জমা ও পরিশোধ</th>
                <th className="py-3 px-4 text-right bg-slate-100/70 font-bold">
                  চূড়ান্ত ব্যালেন্স
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
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Member */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{m.member.name}</div>
                      {m.member.bnName && (
                        <div className="text-[10px] text-slate-400 font-normal">{m.member.bnName}</div>
                      )}
                    </td>

                    {/* Total Meals */}
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-slate-800">
                      {m.totalMeals}
                    </td>

                    {/* Meal Cost */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatBdt(m.mealCost)}
                    </td>

                    {/* Utility Share */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatBdt(m.utilityShare)}
                    </td>

                    {/* Total Cost */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 bg-slate-50/50">
                      {formatBdt(m.totalCost)}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-800 font-medium">
                      {formatBdt(m.totalPaid)}
                      {m.outOfPocketUtilitiesPaid > 0 && (
                        <div className="text-[10px] text-blue-600 font-sans">
                          (+{formatBdt(m.outOfPocketUtilitiesPaid)} বিল পরিশোধ)
                        </div>
                      )}
                    </td>

                    {/* Remaining Balance */}
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums font-extrabold text-sm ${
                        isRefund
                          ? 'text-emerald-700 bg-emerald-50/50'
                          : isDue
                          ? 'text-rose-600 bg-rose-50/50'
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                          <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                          মেস থেকে পাবে
                        </span>
                      ) : isDue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          মেসে জমা দিতে হবে
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
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

      {/* Individual Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.memberSummaries.map((m) => {
          const isRefund = m.status === 'refund';
          const isDue = m.status === 'due';
          const balanceAbs = Math.abs(m.balance);

          return (
            <div
              key={m.member.id}
              className={`rounded-xl p-4 border transition-all ${
                isRefund
                  ? 'bg-white border-emerald-200/90 shadow-2xs hover:border-emerald-300'
                  : isDue
                  ? 'bg-white border-rose-200/90 shadow-2xs hover:border-rose-300'
                  : 'bg-white border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight">{m.member.name}</h4>
                  {m.member.bnName && (
                    <span className="text-xs text-slate-400">{m.member.bnName}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    isRefund
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDue
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isRefund ? 'ফেরত পাবে' : isDue ? 'বকেয়া' : 'সমান'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>মোট মিল:</span>
                  <span className="font-semibold text-slate-800 font-mono tabular-nums">{m.totalMeals} টি</span>
                </div>
                <div className="flex justify-between">
                  <span>মিল খরচ:</span>
                  <span className="font-mono tabular-nums">{formatBdt(m.mealCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>শেয়ার্ড বিল:</span>
                  <span className="font-mono tabular-nums">{formatBdt(m.utilityShare)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                  <span>মোট খরচ:</span>
                  <span className="font-mono tabular-nums text-slate-900">{formatBdt(m.totalCost)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>মোট জমা/পরিশোধ:</span>
                  <span className="font-mono tabular-nums font-bold">{formatBdt(m.totalPaid)}</span>
                </div>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                  isRefund
                    ? 'border-emerald-100 text-emerald-800'
                    : isDue
                    ? 'border-rose-100 text-rose-800'
                    : 'border-slate-100 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold">
                  {isRefund ? 'মেস থেকে পাবে:' : isDue ? 'মেসে জমা দিবে:' : 'ব্যালেন্স:'}
                </span>
                <span className="text-base font-extrabold font-mono tabular-nums">
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
