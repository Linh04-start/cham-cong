import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Calendar,
  DollarSign,
  Search,
  Sparkles,
  Copy,
  ArrowUpDown,
  Zap,
} from 'lucide-react';
import { TimesheetEntry, UserSettings } from '../types';
import {
  calculateWorkHours,
  formatDayMonth,
  formatHours,
  formatVND,
  getDayOfWeekShort,
  parseBreakTime,
} from '../utils/timeParser';

interface TimesheetSheetProps {
  entries: TimesheetEntry[];
  settings: UserSettings;
  onAddEntry: (entry: Omit<TimesheetEntry, 'id'>) => void;
  onUpdateEntry: (id: string, entry: Partial<TimesheetEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onDuplicateEntry: (entry: TimesheetEntry) => void;
}

export const TimesheetSheet: React.FC<TimesheetSheetProps> = ({
  entries,
  settings,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onDuplicateEntry,
}) => {
  // Form nhập ca mới
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeIn, setTimeIn] = useState('08:00');
  const [timeOut, setTimeOut] = useState('17:00');
  const [breakRaw, setBreakRaw] = useState('1:00');
  const [hourlyRate, setHourlyRate] = useState(settings.defaultHourlyRate.toString());
  const [bonus, setBonus] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setHourlyRate(settings.defaultHourlyRate.toString());
  }, [settings.defaultHourlyRate]);

  // Sửa inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimesheetEntry>>({});

  // Tìm kiếm & lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  // Tính toán thời gian thực theo thời gian thực (Live Preview)
  const currentBreakParsed = parseBreakTime(breakRaw);
  const liveCalc = calculateWorkHours(timeIn, timeOut, breakRaw);
  const liveRate = parseInt(hourlyRate, 10) || settings.defaultHourlyRate;
  const liveBonus = parseInt(bonus, 10) || 0;
  const liveTotalPay = Math.round(liveCalc.workHours * liveRate + liveBonus);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rate = parseInt(hourlyRate, 10) || settings.defaultHourlyRate;
    const b = parseInt(bonus, 10) || 0;
    const calc = calculateWorkHours(timeIn, timeOut, breakRaw);
    const total = Math.round(calc.workHours * rate + b);

    onAddEntry({
      userId: '',
      date,
      timeIn,
      timeOut,
      breakRaw,
      breakHours: calc.breakHours,
      workHours: calc.workHours,
      hourlyRate: rate,
      bonus: b,
      totalPay: total,
      note,
    });

    // Reset nhẹ form cho ca tiếp theo
    setNote('');
    setBonus('');
  };

  const applyTemplate = (tplIn: string, tplOut: string, tplBreak: string, label: string) => {
    setTimeIn(tplIn);
    setTimeOut(tplOut);
    setBreakRaw(tplBreak);
    setNote(label);
  };

  const startEdit = (entry: TimesheetEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id: string) => {
    if (!editForm) return;
    const tIn = editForm.timeIn || '08:00';
    const tOut = editForm.timeOut || '17:00';
    const bRaw = editForm.breakRaw || '0';
    const calc = calculateWorkHours(tIn, tOut, bRaw);
    const rate = editForm.hourlyRate || settings.defaultHourlyRate;
    const b = editForm.bonus || 0;
    const total = Math.round(calc.workHours * rate + b);

    onUpdateEntry(id, {
      ...editForm,
      breakHours: calc.breakHours,
      workHours: calc.workHours,
      totalPay: total,
    });

    setEditingId(null);
    setEditForm({});
  };

  // Lọc và sắp xếp danh sách ca
  const filteredEntries = entries
    .filter((e) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        e.date.includes(term) ||
        (e.note && e.note.toLowerCase().includes(term)) ||
        getDayOfWeekShort(e.date).toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortAsc ? cmp : -cmp;
    });

  const totalFilteredHours = filteredEntries.reduce((acc, curr) => acc + (curr.workHours || 0), 0);
  const totalFilteredPay = filteredEntries.reduce((acc, curr) => acc + (curr.totalPay || 0), 0);

  return (
    <div className="min-w-0 space-y-6">
      {/* KHỐI NHẬP CA LÀM VIỆC CÁ NHÂN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
              <Clock className="h-5 w-5 text-emerald-600" />
              <span>Chấm Công Ca Làm Cá Nhân</span>
            </h2>
            <p className="text-xs text-slate-500">
              Nhập giờ vào - ra và thời gian nghỉ để hệ thống tự động tính số giờ làm và tiền lương
            </p>
          </div>

          {/* Mẫu ca nhanh */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Ca nhanh:
            </span>
            <button
              type="button"
              onClick={() => applyTemplate('08:00', '12:00', '0', 'Ca Sáng')}
              className="min-h-9 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 sm:min-h-0"
            >
              ☀️ Sáng (8-12h)
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('13:00', '17:00', '0', 'Ca Chiều')}
              className="min-h-9 rounded-lg bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 sm:min-h-0"
            >
              ⛅ Chiều (13-17h)
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('18:00', '22:00', '0', 'Ca Tối')}
              className="min-h-9 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 sm:min-h-0"
            >
              🌙 Tối (18-22h)
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('08:00', '17:00', '1:00', 'Ca Full 8h')}
              className="min-h-9 rounded-lg bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100 sm:min-h-0"
            >
              ⚡ Full 8h
            </button>
          </div>
        </div>

        {/* Form nhập ca */}
        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {/* Ngày làm */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Ngày làm
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-xs"
              />
            </div>

            {/* Giờ vào */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Giờ vào
              </label>
              <input
                type="time"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-xs"
              />
            </div>

            {/* Giờ ra */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Giờ ra
              </label>
              <input
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-xs"
              />
            </div>

            {/* Nghỉ giữa ca */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Giờ nghỉ</span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {currentBreakParsed.hours > 0 ? `-${formatHours(currentBreakParsed.hours)}` : '0h'}
                </span>
              </label>
              <input
                type="text"
                placeholder="VD: 1:00, 45p, 30m"
                value={breakRaw}
                onChange={(e) => setBreakRaw(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-xs"
              />
            </div>

            {/* Lương / Giờ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                Lương/giờ (VNĐ)
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-xs"
              />
            </div>

            {/* Thưởng / Phụ cấp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thưởng / Phụ cấp
              </label>
              <input
                type="number"
                step="5000"
                min="0"
                placeholder="0"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-xs"
              />
            </div>

            {/* Ghi chú ca */}
            <div className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
              <input
                type="text"
                placeholder="VD: Tăng ca, trực kho..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-xs"
              />
            </div>
          </div>

          {/* Live Preview Box & Nút Lưu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-slate-500">
                Thứ: <strong className="text-slate-800">{getDayOfWeekShort(date)}</strong>
              </span>
              <span className="text-slate-500">
                Giờ làm thực: <strong className="text-emerald-700 text-sm">{formatHours(liveCalc.workHours)}</strong>
              </span>
              <span className="text-slate-500">
                Lương ước tính: <strong className="text-emerald-700 text-sm font-bold">{formatVND(liveTotalPay)}</strong>
              </span>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Ghi nhận ca làm</span>
            </button>
          </div>
        </form>
      </div>

      {/* DANH SÁCH CÁC CA LÀM ĐÃ LƯU */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Thanh công cụ tìm kiếm và thống kê nhanh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 p-4 bg-slate-50/70">
          <div className="flex min-w-0 items-center gap-3">
            <h3 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
              <span>Nhật Ký Chấm Công</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {filteredEntries.length} ca
              </span>
            </h3>
            <span className="ml-auto shrink-0 text-xs font-extrabold text-emerald-700 sm:text-sm">
              {formatVND(totalFilteredPay)}
            </span>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm ngày, ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-10 w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56 sm:text-xs"
              />
            </div>

            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              title={sortAsc ? 'Sắp xếp ngày cũ nhất trước' : 'Sắp xếp ngày mới nhất trước'}
              className="flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <span>{sortAsc ? 'Cũ nhất' : 'Mới nhất'}</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {filteredEntries.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              Chưa có ca làm việc nào phù hợp trong tháng này. Hãy bấm &quot;Ghi nhận ca làm&quot; ở trên!
            </p>
          ) : (
            filteredEntries.map((entry) => {
              const isEditing = editingId === entry.id;
              const dayOfWeek = getDayOfWeekShort(entry.date);
              const isWeekend = dayOfWeek === 'CN' || dayOfWeek === 'T7';

              return (
                <article key={entry.id} className="p-3.5">
                  {isEditing ? (
                    <div className="-m-3.5 space-y-3 bg-emerald-50/70 p-3.5">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="min-w-0">
                          <span className="sr-only">Ngày làm</span>
                          <input
                            aria-label="Ngày làm"
                            type="date"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                          />
                        </label>
                        <label className="min-w-0">
                          <span className="sr-only">Lương mỗi giờ</span>
                          <input
                            aria-label="Lương mỗi giờ"
                            type="number"
                            inputMode="numeric"
                            value={editForm.hourlyRate ?? ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, hourlyRate: parseInt(e.target.value, 10) || 0 })
                            }
                            className="min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="min-w-0">
                          <span className="sr-only">Giờ vào</span>
                          <input
                            aria-label="Giờ vào"
                            type="time"
                            value={editForm.timeIn || ''}
                            onChange={(e) => setEditForm({ ...editForm, timeIn: e.target.value })}
                            className="min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-1.5 text-xs"
                          />
                        </label>
                        <label className="min-w-0">
                          <span className="sr-only">Giờ ra</span>
                          <input
                            aria-label="Giờ ra"
                            type="time"
                            value={editForm.timeOut || ''}
                            onChange={(e) => setEditForm({ ...editForm, timeOut: e.target.value })}
                            className="min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-1.5 text-xs"
                          />
                        </label>
                        <label className="min-w-0">
                          <span className="sr-only">Thời gian nghỉ</span>
                          <input
                            aria-label="Thời gian nghỉ"
                            type="text"
                            value={editForm.breakRaw || ''}
                            onChange={(e) => setEditForm({ ...editForm, breakRaw: e.target.value })}
                            className="min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="sr-only">Thưởng / phụ cấp</span>
                        <input
                          aria-label="Thưởng / phụ cấp"
                          type="number"
                          inputMode="numeric"
                          placeholder="Thưởng / phụ cấp"
                          value={editForm.bonus ?? ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, bonus: parseInt(e.target.value, 10) || 0 })
                          }
                          className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        />
                      </label>
                      <label className="block">
                        <span className="sr-only">Ghi chú</span>
                        <input
                          aria-label="Ghi chú"
                          type="text"
                          placeholder="Ghi chú"
                          value={editForm.note || ''}
                          onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                          className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
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
                          onClick={() => saveEdit(entry.id)}
                          className="min-h-10 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isWeekend ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {dayOfWeek}
                            </span>
                            <span className="font-bold text-slate-900">{formatDayMonth(entry.date)}</span>
                          </div>
                          {entry.note && (
                            <p className="mt-2 break-words text-xs italic text-slate-500">{entry.note}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-base font-extrabold text-emerald-700">{formatVND(entry.totalPay)}</p>
                          <p className="text-[11px] text-slate-500">
                            {formatHours(entry.workHours)} ({formatVND(entry.hourlyRate)}/h)
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-medium text-slate-700">
                            {entry.timeIn && entry.timeOut ? `${entry.timeIn} - ${entry.timeOut}` : 'Thủ công'}
                          </span>
                          {entry.breakHours > 0 && (
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                              Nghỉ {entry.breakRaw}
                            </span>
                          )}
                          {entry.bonus > 0 && (
                            <span className="text-[11px] font-semibold text-emerald-600">
                              +{formatVND(entry.bonus)}
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onDuplicateEntry(entry)}
                            aria-label="Sao chép ca làm"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            aria-label="Sửa ca làm"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Bạn có chắc muốn xóa ca làm này không?')) {
                                onDeleteEntry(entry.id);
                              }
                            }}
                            aria-label="Xóa ca làm"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>

        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold md:hidden">
            <span className="text-slate-600">Tổng cộng ({filteredEntries.length} ca):</span>
            <span className="shrink-0 text-right text-emerald-700">
              {formatVND(totalFilteredPay)} <span className="font-medium text-slate-500">({formatHours(totalFilteredHours)})</span>
            </span>
          </div>
        )}

        {/* Bảng dữ liệu chấm công trên màn hình lớn */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ngày / Thứ</th>
                <th className="py-3 px-3">Giờ vào - Giờ ra</th>
                <th className="py-3 px-3">Nghỉ</th>
                <th className="py-3 px-3 text-right">Giờ làm</th>
                <th className="py-3 px-3 text-right">Lương/giờ</th>
                <th className="py-3 px-3 text-right">Thưởng</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-3">Ghi chú</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Chưa có ca làm việc nào phù hợp trong tháng này. Hãy bấm &quot;Ghi nhận ca làm&quot; ở trên!
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isEditing = editingId === entry.id;

                  if (isEditing) {
                    return (
                      <tr key={entry.id} className="bg-emerald-50/50">
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full rounded border border-slate-300 p-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={editForm.timeIn || ''}
                              onChange={(e) => setEditForm({ ...editForm, timeIn: e.target.value })}
                              className="rounded border border-slate-300 p-1 text-xs w-20"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={editForm.timeOut || ''}
                              onChange={(e) => setEditForm({ ...editForm, timeOut: e.target.value })}
                              className="rounded border border-slate-300 p-1 text-xs w-20"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editForm.breakRaw || ''}
                            onChange={(e) => setEditForm({ ...editForm, breakRaw: e.target.value })}
                            className="rounded border border-slate-300 p-1 text-xs w-16"
                          />
                        </td>
                        <td className="py-2 px-3 text-right text-slate-500 font-medium">Tự tính</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editForm.hourlyRate || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, hourlyRate: parseInt(e.target.value, 10) || 0 })
                            }
                            className="rounded border border-slate-300 p-1 text-xs w-24 text-right"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editForm.bonus || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, bonus: parseInt(e.target.value, 10) || 0 })
                            }
                            className="rounded border border-slate-300 p-1 text-xs w-20 text-right"
                          />
                        </td>
                        <td className="py-2 px-3 text-right text-slate-500 font-medium">Tự tính</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editForm.note || ''}
                            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                            className="w-full rounded border border-slate-300 p-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(entry.id)}
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

                  const dayOfWeek = getDayOfWeekShort(entry.date);
                  const isWeekend = dayOfWeek === 'CN' || dayOfWeek === 'T7';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              isWeekend ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {dayOfWeek}
                          </span>
                          <span className="font-semibold text-slate-900">{formatDayMonth(entry.date)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {entry.timeIn && entry.timeOut ? (
                          <span className="font-medium">
                            {entry.timeIn} - {entry.timeOut}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Thủ công</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        {entry.breakHours > 0 ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                            {entry.breakRaw} ({formatHours(entry.breakHours)})
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-slate-800">
                        {formatHours(entry.workHours)}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap text-slate-600">
                        {formatVND(entry.hourlyRate)}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {entry.bonus ? (
                          <span className="font-semibold text-emerald-600">+{formatVND(entry.bonus)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-extrabold text-emerald-700 text-sm">
                        {formatVND(entry.totalPay)}
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate" title={entry.note}>
                        {entry.note || <span className="text-slate-300">-</span>}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onDuplicateEntry(entry)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Sao chép sang ca hôm nay"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(entry)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc muốn xóa ca làm này không?')) {
                                onDeleteEntry(entry.id);
                              }
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Xóa ca này"
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
            {filteredEntries.length > 0 && (
              <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-600">
                    Tổng cộng ({filteredEntries.length} ca):
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-extrabold">
                    {formatHours(totalFilteredHours)}
                  </td>
                  <td colSpan={2}></td>
                  <td className="py-3 px-4 text-right text-emerald-700 font-extrabold text-sm sm:text-base">
                    {formatVND(totalFilteredPay)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
