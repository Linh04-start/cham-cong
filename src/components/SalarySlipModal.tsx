import React from 'react';
import { X, Printer, DollarSign, Wallet, TrendingDown, PiggyBank } from 'lucide-react';
import { Expense, SummaryStats, TimesheetEntry, UserProfile } from '../types';
import { formatDayMonth, formatFullDate, formatHours, formatVND } from '../utils/timeParser';
import { CATEGORY_CONFIG } from './ExpensesSheet';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  selectedMonth: string;
  entries: TimesheetEntry[];
  expenses: Expense[];
  stats: SummaryStats;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedMonth,
  entries,
  expenses,
  stats,
}) => {
  if (!isOpen) return null;

  const [year, month] =
    selectedMonth && selectedMonth !== 'all' ? selectedMonth.split('-') : ['2026', '09'];
  const monthDisplay = selectedMonth === 'all' ? 'Tất cả các tháng' : `Tháng ${month}/${year}`;

  const handlePrint = () => {
    window.print();
  };

  const userName = currentUser?.name || 'Tài khoản của tôi';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-2 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Modal Top Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4 print:hidden sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-bold text-slate-900 break-words">
              📄 Phiếu Báo Lương & Đối Chiếu Chi Tiêu Đi Làm
            </span>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <button
              onClick={handlePrint}
              className="flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              In phiếu / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="min-w-0 space-y-6 overflow-y-auto p-4 font-sans text-slate-800 sm:p-8" id="salary-slip-content">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b-2 border-slate-900 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-black uppercase tracking-wider text-slate-900 sm:text-xl">
                PHIẾU BÁO LƯƠNG & CHI TIÊU CÁ NHÂN
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kỳ chấm công: <span className="font-bold text-slate-800">{monthDisplay}</span>
              </p>
              <p className="text-xs text-slate-500">
                Ngày xuất phiếu: {formatFullDate(new Date().toISOString().split('T')[0])}
              </p>
            </div>
            <div className="min-w-0 text-left sm:text-right">
              <span className="text-xs font-bold uppercase text-slate-400">Chủ tài khoản</span>
              <div className="text-base font-black text-slate-900">{userName}</div>
              {currentUser?.email && (
                <div className="text-xs text-slate-500">{currentUser.email}</div>
              )}
            </div>
          </div>

          {/* Key Summary Cards */}
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                1. Tổng Tiền Lương (Gross)
              </span>
              <div className="mt-1 break-words text-lg font-black text-slate-900">
                {formatVND(stats.totalEarnings)}
              </div>
              <span className="text-[11px] text-slate-500">
                {formatHours(stats.totalHours)} ({stats.totalDays} ngày làm)
              </span>
            </div>

            <div className="min-w-0 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                2. Chi Tiêu Đi Làm
              </span>
              <div className="mt-1 break-words text-lg font-black text-rose-700">
                -{formatVND(stats.totalExpenses)}
              </div>
              <span className="text-[11px] text-rose-600 font-medium">
                Ăn uống, trà sữa, đổ xăng...
              </span>
            </div>

            <div className="min-w-0 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <PiggyBank className="w-3 h-3" />
                3. Tiền Thực Cầm Về (Net)
              </span>
              <div className="mt-1 break-words text-xl font-black text-emerald-900">
                {formatVND(stats.netEarnings)}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Bỏ ống heo tiết kiệm
              </span>
            </div>
          </div>

          {/* Breakdown: Chi tiêu đi làm */}
          {expenses.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">
                Khoản Chi Cá Nhân Lúc Đi Làm Trong Tháng ({expenses.length} khoản):
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((cat) => {
                  const amt = stats.expensesByCategory[cat] || 0;
                  if (amt === 0) return null;
                  return (
                    <div key={cat} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-slate-500">{CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}</span>
                      <div className="font-bold text-slate-800 mt-0.5">{formatVND(amt)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed entries list */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">
              Chi Tiết Ca Làm Việc ({entries.length} ca):
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Ngày</th>
                    <th className="py-2 px-3">Giờ làm</th>
                    <th className="py-2 px-3">Nghỉ</th>
                    <th className="py-2 px-3 text-right">Số giờ</th>
                    <th className="py-2 px-3 text-right">Lương/giờ</th>
                    <th className="py-2 px-3 text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.slice(0, 15).map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-2 px-3 font-medium">{formatDayMonth(entry.date)}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {entry.timeIn && entry.timeOut ? `${entry.timeIn} - ${entry.timeOut}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {entry.breakHours > 0 ? entry.breakRaw : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        {formatHours(entry.workHours)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">
                        {formatVND(entry.hourlyRate)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {formatVND(entry.totalPay)}
                      </td>
                    </tr>
                  ))}
                  {entries.length > 15 && (
                    <tr>
                      <td colSpan={6} className="py-2 px-3 text-center text-slate-400 italic">
                        ... và {entries.length - 15} ca làm việc khác trong tháng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Sổ Chấm Công & Quản Lý Chi Tiêu Cá Nhân</span>
            <span>Trang 1 / 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
