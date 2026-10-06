import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Flame,
  Coffee,
  Target,
  PartyPopper,
  Zap,
  CheckCircle2,
  Sparkles,
  Wallet,
  PiggyBank,
  TrendingDown,
  FileText,
  Fuel,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DayStatItem,
  ExpenseCategory,
  SummaryStats,
  TargetProgress,
  UserSettings,
  WeekStatItem,
} from '../types';
import {
  formatDayMonth,
  formatFullDate,
  formatHours,
  formatVND,
} from '../utils/timeParser';
import { CATEGORY_CONFIG } from './ExpensesSheet';

interface DashboardSheetProps {
  stats: SummaryStats;
  targetProgress: TargetProgress;
  dailyStats: DayStatItem[];
  weeklyStats: WeekStatItem[];
  settings: UserSettings;
  onOpenSalarySlip: () => void;
  onOpenSettings: () => void;
}

export const DashboardSheet: React.FC<DashboardSheetProps> = ({
  stats,
  targetProgress,
  dailyStats,
  weeklyStats,
  settings,
  onOpenSalarySlip,
  onOpenSettings,
}) => {
  const [chartView, setChartView] = useState<'day' | 'week'>('day');

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. MỤC TIÊU THU NHẬP THÁNG */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-6 sm:p-8 text-white shadow-lg shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Target className="h-3.5 w-3.5 text-emerald-200" />
              <span>Mục Tiêu Thu Nhập Tháng Này</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black tracking-tight">
                {formatVND(stats.totalEarnings)}
              </span>
              <span className="text-emerald-200 text-sm font-semibold">
                / {formatVND(targetProgress.targetAmount)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100">
              {targetProgress.isCompleted ? (
                <span className="font-bold text-yellow-300 flex items-center gap-1">
                  <PartyPopper className="h-4 w-4" /> Xuất sắc! Bạn đã hoàn thành 100% mục tiêu thu nhập tháng!
                </span>
              ) : (
                <span>
                  Còn thiếu <strong>{formatVND(targetProgress.remaining)}</strong> để đạt chỉ tiêu. Cần trung bình{' '}
                  <strong>{formatVND(targetProgress.dailyNeeded)}/ngày</strong> trong {targetProgress.daysLeftInMonth} ngày còn lại.
                </span>
              )}
            </p>
          </div>

          {/* Vòng tròn tiến độ & Nút ăn mừng */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20">
              <span className="text-3xl font-black tracking-tight">{targetProgress.percentage}%</span>
              <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">Tiến độ</span>
            </div>

            <button
              onClick={triggerConfetti}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-md hover:scale-105 active:scale-95 transition-all"
              title="Bấm để bắn pháo hoa ăn mừng"
            >
              <Sparkles className="h-6 w-6 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Thanh Progress Bar */}
        <div className="relative z-10 mt-6 h-3 w-full overflow-hidden rounded-full bg-black/20 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, targetProgress.percentage)}%` }}
          />
        </div>
      </div>

      {/* 2. BỘ CARD CHỈ SỐ TÀI CHÍNH CÁ NHÂN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng thu nhập */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng tiền kiếm được
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatVND(stats.totalEarnings)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span>TB: <strong>{formatVND(stats.avgPayPerDay)}</strong>/ngày</span>
          </div>
        </div>

        {/* Card 2: Chi tiêu đi làm */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Chi tiêu đi làm
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-700 tracking-tight">
            -{formatVND(stats.totalExpenses)}
          </div>
          <div className="mt-1 text-xs text-rose-600 font-medium">
            Trà sữa, xăng xe, cơm trưa... ({stats.expenseRatio}%)
          </div>
        </div>

        {/* Card 3: Tiền thực nhận (Lương ròng / Bỏ ống heo) */}
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm ring-1 ring-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Tiền Bỏ Ống Heo (Lương Ròng)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900 tracking-tight">
            {formatVND(stats.netEarnings)}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-semibold">
            Tiền thực tế bạn giữ lại sau ca làm
          </div>
        </div>

        {/* Card 4: Tổng giờ làm việc */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng giờ làm việc
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatHours(stats.totalHours)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.totalDays} ngày đi làm (TB {stats.avgHoursPerDay}h/ngày)
          </div>
        </div>
      </div>

      {/* 3. CHI TIẾT DANH MỤC CHI TIÊU & BIỂU ĐỒ HOẠT ĐỘNG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Phân bổ các khoản chi tiêu đi làm */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-500" />
              <span>Phân Bổ Chi Tiêu Đi Làm</span>
            </h3>
            <span className="text-xs font-bold text-rose-600">
              {formatVND(stats.totalExpenses)}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Tổng số tiền bạn đã tiêu trong các ca làm việc (ăn uống, mua nước, đổ xăng):
          </p>

          <div className="space-y-3">
            {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((catKey) => {
              const cfg = CATEGORY_CONFIG[catKey];
              const amount = stats.expensesByCategory[catKey] || 0;
              const pct = stats.totalExpenses > 0 ? Math.round((amount / stats.totalExpenses) * 100) : 0;

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatVND(amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={onOpenSalarySlip}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2.5 px-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Xem Phiếu Báo Lương Đầy Đủ</span>
            </button>
          </div>
        </div>

        {/* Cột phải (2 cột): Biểu đồ ngày & tuần */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Biểu Đồ Giờ Làm & Thu Nhập</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Xem chi tiết năng suất và tiền kiếm được theo từng ngày hoặc từng tuần
                </p>
              </div>

              <div className="flex items-center rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setChartView('day')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    chartView === 'day' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Theo ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('week')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    chartView === 'week' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Theo tuần
                </button>
              </div>
            </div>

            {/* Vùng vẽ biểu đồ */}
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'day' ? (
                  <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: number | string | undefined, name: string | undefined) => {
                        const num = typeof val === 'number' ? val : Number(val || 0);
                        if (name === 'earnings') return [formatVND(num), 'Lương'];
                        if (name === 'expenses') return [formatVND(num), 'Chi tiêu'];
                        return [formatHours(num), 'Giờ làm'];
                      }}
                      labelFormatter={(label) => `Ngày ${label}`}
                    />
                    <Bar dataKey="earnings" name="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: number | string | undefined, name: string | undefined) => {
                        const num = typeof val === 'number' ? val : Number(val || 0);
                        if (name === 'earnings') return [formatVND(num), 'Lương'];
                        if (name === 'expenses') return [formatVND(num), 'Chi tiêu'];
                        return [formatHours(num), 'Giờ làm'];
                      }}
                    />
                    <Bar dataKey="earnings" name="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
              <span>Tiền lương kiếm được</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
              <span>Chi tiêu đi làm</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. BẢNG THÀNH TÍCH VUI VẺ & GHI NHẬN NỖ LỰC 😂 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Bảng Thành Tích & Cày Cuốc Vui Vẻ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Huy hiệu 1: Chuỗi cày cuốc */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Chuỗi cày cuốc (Streak)</span>
            </div>
            <div className="mt-2 text-2xl font-black text-orange-950">
              {stats.currentStreak} ngày liên tiếp
            </div>
            <div className="text-xs text-orange-700 mt-1">
              Kỷ lục tháng: {stats.maxStreak} ngày 🔥
            </div>
          </div>

          {/* Huy hiệu 2: Quy đổi ly cà phê */}
          <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase">
              <Coffee className="h-4 w-4 text-amber-600" />
              <span>Quy đổi cà phê</span>
            </div>
            <div className="mt-2 text-2xl font-black text-amber-950">
              {stats.coffeeCount} ly ☕
            </div>
            <div className="text-xs text-amber-700 mt-1">
              Thu nhập tương đương {stats.coffeeCount} ly cà phê {formatVND(settings.coffeePrice)}
            </div>
          </div>

          {/* Huy hiệu 3: Ngày đỉnh cao */}
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span>Ngày kiếm đậm nhất</span>
            </div>
            <div className="mt-2 text-xl font-black text-emerald-950">
              {stats.topEarningDay ? formatVND(stats.topEarningDay.amount) : '0đ'}
            </div>
            <div className="text-xs text-emerald-700 mt-1 truncate">
              {stats.topEarningDay ? formatDayMonth(stats.topEarningDay.date) : 'Chưa có'} (
              {stats.topEarningDay ? formatHours(stats.topEarningDay.hours) : '0h'})
            </div>
          </div>

          {/* Huy hiệu 4: Tổng giờ nghỉ */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Nghỉ ngơi lấy sức</span>
            </div>
            <div className="mt-2 text-2xl font-black text-purple-950">
              {formatHours(stats.totalBreakHours)}
            </div>
            <div className="text-xs text-purple-700 mt-1">
              Thời gian nghỉ ngơi giữa các ca làm việc
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
