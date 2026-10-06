import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  DollarSign,
  Coffee,
  Fuel,
  Utensils,
  Search,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  Wallet,
  PiggyBank,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Expense, ExpenseCategory, UserSettings } from '../types';
import { formatDayMonth, formatVND, getDayOfWeekShort } from '../utils/timeParser';

interface ExpensesSheetProps {
  expenses: Expense[];
  settings: UserSettings;
  totalEarnings: number;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (id: string, expense: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

export const CATEGORY_CONFIG: {
  [key in ExpenseCategory]: {
    label: string;
    icon: string;
    color: string;
    bg: string;
    badge: string;
  };
} = {
  milktea: {
    label: 'Trà sữa',
    icon: '🧋',
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    badge: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  coffee: {
    label: 'Cà phê',
    icon: '☕',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  food: {
    label: 'Cơm / Ăn uống',
    icon: '🍔',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  gas: {
    label: 'Đổ xăng',
    icon: '⛽',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  parking: {
    label: 'Gửi xe',
    icon: '🛵',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  snack: {
    label: 'Ăn vặt',
    icon: '🍿',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  other: {
    label: 'Chi phí khác',
    icon: '🛍️',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

export const ExpensesSheet: React.FC<ExpensesSheetProps> = ({
  expenses,
  settings,
  totalEarnings,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  // Form thêm khoản chi mới
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<ExpenseCategory>('milktea');
  const [amount, setAmount] = useState('35000');
  const [note, setNote] = useState('');

  // Sửa inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

  // Tìm kiếm & sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState(false);

  // Thống kê tổng hợp chi tiêu
  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netTakeHome = Math.max(0, totalEarnings - totalExpenseAmount);
  const expensePercentage = totalEarnings > 0 ? ((totalExpenseAmount / totalEarnings) * 100).toFixed(1) : 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) return;

    onAddExpense({
      userId: '',
      date,
      category,
      amount: val,
      note: note.trim(),
    });

    setNote('');
  };

  const applyQuickPreset = (cat: ExpenseCategory, presetAmount: number, presetNote: string) => {
    setCategory(cat);
    setAmount(presetAmount.toString());
    setNote(presetNote);
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditForm({ ...exp });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id: string) => {
    if (!editForm) return;
    const val = typeof editForm.amount === 'number' ? editForm.amount : parseInt(String(editForm.amount || 0), 10);
    onUpdateExpense(id, {
      ...editForm,
      amount: val,
    });
    setEditingId(null);
    setEditForm({});
  };

  // Lọc và sắp xếp
  const filteredExpenses = expenses
    .filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const catLabel = CATEGORY_CONFIG[e.category]?.label.toLowerCase() || '';
      return (
        e.date.includes(term) ||
        (e.note && e.note.toLowerCase().includes(term)) ||
        catLabel.includes(term)
      );
    })
    .sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortAsc ? cmp : -cmp;
    });

  return (
    <div className="min-w-0 space-y-6">
      {/* BANNER THỐNG KÊ CHI TIÊU NHANH */}
      <div className="grid grid-cols-1 gap-4 min-[390px]:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng chi tiêu */}
        <div className="min-w-0 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Tổng chi tiêu đi làm
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 break-words text-xl font-black tracking-tight text-rose-900 sm:text-2xl">
            {formatVND(totalExpenseAmount)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-700">
            <span>Chiếm <strong>{expensePercentage}%</strong> tiền làm ra</span>
          </div>
        </div>

        {/* Card 2: Tiền thực nhận còn lại */}
        <div className="min-w-0 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Tiền Bỏ Ống Heo (Lương Ròng)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 break-words text-xl font-black tracking-tight text-emerald-900 sm:text-2xl">
            {formatVND(netTakeHome)}
          </div>
          <div className="mt-1 text-xs text-emerald-700">
            Lương kiếm ({formatVND(totalEarnings)}) - Tiêu pha
          </div>
        </div>

        {/* Card 3: Chi Trà sữa & Cà phê */}
        <div className="min-w-0 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Trà Sữa & Cà Phê 🧋
            </span>
            <span className="text-xl">☕</span>
          </div>
          <div className="mt-2 break-words text-xl font-black tracking-tight text-amber-950 sm:text-2xl">
            {formatVND(
              expenses
                .filter((e) => e.category === 'milktea' || e.category === 'coffee')
                .reduce((acc, curr) => acc + curr.amount, 0)
            )}
          </div>
          <div className="mt-1 text-xs text-amber-800">
            {expenses.filter((e) => e.category === 'milktea' || e.category === 'coffee').length} ly đã uống
          </div>
        </div>

        {/* Card 4: Chi Xăng xe & Đi lại */}
        <div className="min-w-0 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Xăng Xe & Gửi Xe ⛽
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm">
              <Fuel className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 break-words text-xl font-black tracking-tight text-blue-950 sm:text-2xl">
            {formatVND(
              expenses
                .filter((e) => e.category === 'gas' || e.category === 'parking')
                .reduce((acc, curr) => acc + curr.amount, 0)
            )}
          </div>
          <div className="mt-1 text-xs text-blue-700">
            Phí phương tiện đi làm
          </div>
        </div>
      </div>

      {/* KHỐI FORM NHẬP CHI TIÊU CÁ NHÂN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
              <Wallet className="h-5 w-5 text-amber-500" />
              <span>Ghi Chép Khoản Chi Đi Làm</span>
            </h2>
            <p className="text-xs text-slate-500">
              Theo dõi tiền ăn uống, trà sữa, đổ xăng trong ca làm việc để biết chính xác bạn giữ lại được bao nhiêu tiền lương
            </p>
          </div>

          {/* Nút bấm nhanh 1 chạm */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Nhanh:
            </span>
            <button
              type="button"
              onClick={() => applyQuickPreset('milktea', 35000, 'Trà sữa trân châu')}
              className="min-h-9 rounded-lg bg-pink-50 px-2 py-1 text-xs font-semibold text-pink-700 transition-colors hover:bg-pink-100 sm:min-h-0"
            >
              🧋 35k Trà sữa
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('food', 40000, 'Cơm trưa')}
              className="min-h-9 rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 sm:min-h-0"
            >
              🍔 40k Cơm trưa
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('gas', 50000, 'Đổ xăng')}
              className="min-h-9 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 sm:min-h-0"
            >
              ⛽ 50k Đổ xăng
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('coffee', 25000, 'Cà phê sáng')}
              className="min-h-9 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 sm:min-h-0"
            >
              ☕ 25k Cà phê
            </button>
          </div>
        </div>

        {/* Form nhập chi tiêu */}
        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Ngày chi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Ngày chi
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-xs"
              />
            </div>

            {/* Danh mục chi */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Danh mục chi tiêu
              </label>
              <div className="grid grid-cols-3 gap-1 min-[390px]:grid-cols-4 sm:grid-cols-7">
                {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((catKey) => {
                  const cfg = CATEGORY_CONFIG[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`flex min-h-11 min-w-0 flex-col items-center justify-center rounded-xl p-1.5 text-center transition-all ${
                        isSelected
                          ? 'border-2 border-amber-500 bg-amber-50 shadow-xs'
                          : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-base">{cfg.icon}</span>
                      <span className="text-[10px] font-bold truncate max-w-full">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Số tiền (VNĐ) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                Số tiền (VNĐ)
              </label>
              <input
                type="number"
                step="1000"
                min="1000"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 35000"
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-xs"
              />
            </div>

            {/* Ghi chú chi tiêu */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú cụ thể</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Trà sữa ô long 50% đường, Cơm tấm sườn bì..."
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-xs"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-amber-50/50 p-3 ring-1 ring-amber-200">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-amber-900">
              <span>Đang chọn: <strong>{CATEGORY_CONFIG[category].icon} {CATEGORY_CONFIG[category].label}</strong></span>
              <span>•</span>
              <span>Số tiền: <strong className="text-sm font-bold text-rose-700">{formatVND(parseInt(amount, 10) || 0)}</strong></span>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-600 sm:text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Ghi lại khoản chi này</span>
            </button>
          </div>
        </form>
      </div>

      {/* DANH SÁCH CHI TIÊU ĐÃ GHI */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 p-4 bg-slate-50/70">
          <div className="flex min-w-0 items-center gap-3">
            <h3 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
              <span>Sổ Chi Tiêu Đi Làm</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {filteredExpenses.length} khoản
              </span>
            </h3>
            <span className="ml-auto shrink-0 text-xs font-extrabold text-rose-600 sm:text-sm">
              -{formatVND(filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0))}
            </span>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-wrap">
            {/* Filter by Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:flex-none sm:px-3"
            >
              <option value="all">Tất cả danh mục</option>
              {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORY_CONFIG[catKey].icon} {CATEGORY_CONFIG[catKey].label}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm ngày, ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-10 w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:w-48 sm:pr-3"
              />
            </div>

            {/* Sort */}
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              title={sortAsc ? 'Cũ nhất trước' : 'Mới nhất trước'}
              className="flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">{sortAsc ? 'Cũ nhất' : 'Mới nhất'}</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {filteredExpenses.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              Chưa có khoản chi nào trong mục này. Bấm nút phía trên để ghi lại!
            </p>
          ) : (
            filteredExpenses.map((exp) => {
              const isEditing = editingId === exp.id;
              const cfg = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.other;
              const dayOfWeek = getDayOfWeekShort(exp.date);

              return (
                <article key={exp.id} className="p-3.5">
                  {isEditing ? (
                    <div className="-m-3.5 space-y-3 bg-amber-50/70 p-3.5">
                      <label className="block">
                        <span className="sr-only">Ngày chi</span>
                        <input
                          aria-label="Ngày chi"
                          type="date"
                          value={editForm.date || ''}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="sr-only">Danh mục chi</span>
                        <select
                          aria-label="Danh mục chi"
                          value={editForm.category || 'other'}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })
                          }
                          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                        >
                          {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((catKey) => (
                            <option key={catKey} value={catKey}>
                              {CATEGORY_CONFIG[catKey].icon} {CATEGORY_CONFIG[catKey].label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="sr-only">Số tiền</span>
                        <input
                          aria-label="Số tiền"
                          type="number"
                          inputMode="numeric"
                          value={editForm.amount ?? ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, amount: parseInt(e.target.value, 10) || 0 })
                          }
                          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-rose-600"
                        />
                      </label>
                      <label className="block">
                        <span className="sr-only">Ghi chú</span>
                        <input
                          aria-label="Ghi chú"
                          type="text"
                          placeholder="Ghi chú cụ thể"
                          value={editForm.note || ''}
                          onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                        />
                      </label>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="min-h-10 rounded-lg px-3 text-xs font-semibold text-slate-500"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(exp.id)}
                          className="min-h-10 rounded-lg bg-amber-500 px-4 text-xs font-bold text-white"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
                          {cfg.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-1.5">
                            <span className="text-xs font-bold text-slate-800">{cfg.label}</span>
                            <span className="text-[10px] text-slate-400">
                              · {dayOfWeek}, {formatDayMonth(exp.date)}
                            </span>
                          </div>
                          <p className="mt-1 break-words text-xs italic text-slate-400">
                            {exp.note || 'Không có ghi chú'}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-extrabold text-rose-600">
                          -{formatVND(exp.amount)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(exp)}
                          aria-label="Sửa khoản chi"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc muốn xóa khoản chi này không?')) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          aria-label="Xóa khoản chi"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {filteredExpenses.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold md:hidden">
            <span className="text-slate-600">Tổng chi tiêu:</span>
            <span className="shrink-0 text-rose-600">
              -{formatVND(filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0))}
            </span>
          </div>
        )}

        {/* Bảng chi tiêu trên màn hình lớn */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ngày / Thứ</th>
                <th className="py-3 px-3">Danh mục</th>
                <th className="py-3 px-3">Ghi chú</th>
                <th className="py-3 px-4 text-right">Số tiền</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Chưa có khoản chi nào trong mục này. Bấm nút phía trên để ghi lại!
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isEditing = editingId === exp.id;
                  const cfg = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.other;

                  if (isEditing) {
                    return (
                      <tr key={exp.id} className="bg-amber-50/50">
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full rounded border border-slate-300 p-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editForm.category || 'other'}
                            onChange={(e) =>
                              setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })
                            }
                            className="rounded border border-slate-300 p-1 text-xs"
                          >
                            {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((catKey) => (
                              <option key={catKey} value={catKey}>
                                {CATEGORY_CONFIG[catKey].icon} {CATEGORY_CONFIG[catKey].label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editForm.note || ''}
                            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                            className="w-full rounded border border-slate-300 p-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editForm.amount || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, amount: parseInt(e.target.value, 10) || 0 })
                            }
                            className="rounded border border-slate-300 p-1 text-xs w-28 text-right font-bold"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(exp.id)}
                              className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                              title="Lưu"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded p-1 text-slate-400 hover:bg-slate-200"
                              title="Hủy"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const dayOfWeek = getDayOfWeekShort(exp.date);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {dayOfWeek}
                          </span>
                          <span className="font-semibold text-slate-900">{formatDayMonth(exp.date)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${cfg.badge}`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {exp.note || <span className="text-slate-300 italic">Không có ghi chú</span>}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-extrabold text-rose-600 text-sm">
                        -{formatVND(exp.amount)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(exp)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Sửa khoản chi"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc muốn xóa khoản chi này không?')) {
                                onDeleteExpense(exp.id);
                              }
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Xóa khoản chi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredExpenses.length > 0 && (
              <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-600">
                    Tổng chi tiêu ({filteredExpenses.length} khoản):
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600 font-extrabold text-sm sm:text-base">
                    -{formatVND(filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
