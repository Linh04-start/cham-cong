import {
  DayStatItem,
  Expense,
  ExpenseCategory,
  SummaryStats,
  TargetProgress,
  TimesheetEntry,
  UserSettings,
  WeekStatItem,
} from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  defaultHourlyRate: 30000,
  monthlyTarget: 5000000,
  coffeePrice: 30000,
  selectedMonth: '2026-09',
};

export const INITIAL_SAMPLE_ENTRIES: TimesheetEntry[] = [
  {
    id: 'ts-1',
    userId: 'default',
    date: '2026-09-01',
    timeIn: '08:00',
    timeOut: '17:00',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 8,
    hourlyRate: 30000,
    totalPay: 240000,
    note: 'Đầu tháng khởi động nhẹ nhàng',
  },
  {
    id: 'ts-2',
    userId: 'default',
    date: '2026-09-02',
    timeIn: '08:30',
    timeOut: '17:30',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 8,
    hourlyRate: 30000,
    totalPay: 240000,
    note: 'Ca làm việc tiêu chuẩn',
  },
  {
    id: 'ts-3',
    userId: 'default',
    date: '2026-09-03',
    timeIn: '08:00',
    timeOut: '16:30',
    breakRaw: '45p',
    breakHours: 0.75,
    workHours: 7.75,
    hourlyRate: 30000,
    totalPay: 232500,
    note: 'Về sớm 30 phút có việc',
  },
  {
    id: 'ts-4',
    userId: 'default',
    date: '2026-09-04',
    timeIn: '08:00',
    timeOut: '18:00',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 9,
    hourlyRate: 30000,
    totalPay: 270000,
    note: 'Tăng ca 1 tiếng hỗ trợ công việc',
  },
  {
    id: 'ts-5',
    userId: 'default',
    date: '2026-09-05',
    timeIn: '09:00',
    timeOut: '14:00',
    breakRaw: '0',
    breakHours: 0,
    workHours: 5,
    hourlyRate: 30000,
    bonus: 50000,
    totalPay: 200000,
    note: 'Thứ 7 nửa ngày + phụ cấp chuyên cần',
  },
  {
    id: 'ts-6',
    userId: 'default',
    date: '2026-09-08',
    timeIn: '08:00',
    timeOut: '17:00',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 8,
    hourlyRate: 30000,
    totalPay: 240000,
    note: 'Đầu tuần sung sức',
  },
  {
    id: 'ts-7',
    userId: 'default',
    date: '2026-09-09',
    timeIn: '08:00',
    timeOut: '18:30',
    breakRaw: '1:30',
    breakHours: 1.5,
    workHours: 9,
    hourlyRate: 30000,
    totalPay: 270000,
    note: 'Tăng ca hỗ trợ đơn hàng',
  },
  {
    id: 'ts-8',
    userId: 'default',
    date: '2026-09-10',
    timeIn: '08:15',
    timeOut: '17:15',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 8,
    hourlyRate: 30000,
    totalPay: 240000,
    note: 'Ca làm việc tốt',
  },
  {
    id: 'ts-9',
    userId: 'default',
    date: '2026-09-11',
    timeIn: '08:00',
    timeOut: '17:00',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 8,
    hourlyRate: 30000,
    totalPay: 240000,
    note: 'Thứ 6 hoàn thành mục tiêu',
  },
  {
    id: 'ts-10',
    userId: 'default',
    date: '2026-09-15',
    timeIn: '08:00',
    timeOut: '17:00',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 8,
    hourlyRate: 30000,
    totalPay: 240000,
    note: 'Ca tiêu chuẩn',
  },
  {
    id: 'ts-11',
    userId: 'default',
    date: '2026-09-16',
    timeIn: '08:00',
    timeOut: '18:00',
    breakRaw: '1:00',
    breakHours: 1,
    workHours: 9,
    hourlyRate: 30000,
    totalPay: 270000,
    note: 'Tăng ca nhiệt tình',
  },
];

export const INITIAL_SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    userId: 'default',
    date: '2026-09-01',
    category: 'milktea',
    amount: 35000,
    note: 'Trà sữa trân châu mừng đầu tháng 🧋',
  },
  {
    id: 'exp-2',
    userId: 'default',
    date: '2026-09-02',
    category: 'gas',
    amount: 70000,
    note: 'Đổ xăng đầy bình đi làm ⛽',
  },
  {
    id: 'exp-3',
    userId: 'default',
    date: '2026-09-03',
    category: 'food',
    amount: 40000,
    note: 'Cơm sườn trưa 🍔',
  },
  {
    id: 'exp-4',
    userId: 'default',
    date: '2026-09-04',
    category: 'coffee',
    amount: 25000,
    note: 'Cà phê muối tỉnh táo tăng ca ☕',
  },
  {
    id: 'exp-5',
    userId: 'default',
    date: '2026-09-05',
    category: 'parking',
    amount: 10000,
    note: 'Vé gửi xe 🛵',
  },
  {
    id: 'exp-6',
    userId: 'default',
    date: '2026-09-08',
    category: 'milktea',
    amount: 45000,
    note: 'Trà sữa olong nướng kem cheese 🧋',
  },
  {
    id: 'exp-7',
    userId: 'default',
    date: '2026-09-09',
    category: 'food',
    amount: 45000,
    note: 'Bún bò Huế ăn trưa',
  },
  {
    id: 'exp-8',
    userId: 'default',
    date: '2026-09-11',
    category: 'snack',
    amount: 20000,
    note: 'Bánh tráng trộn xế chiều 🍿',
  },
  {
    id: 'exp-9',
    userId: 'default',
    date: '2026-09-15',
    category: 'gas',
    amount: 60000,
    note: 'Đổ xăng xe máy ⛽',
  },
  {
    id: 'exp-10',
    userId: 'default',
    date: '2026-09-16',
    category: 'coffee',
    amount: 25000,
    note: 'Cà phê đen đá ☕',
  },
];

// ==================== CÁC HÀM LƯU TRỮ LOCALSTORAGE THEO USER UID ====================

export function loadLocalSettings(uid?: string): UserSettings {
  try {
    const key = uid ? `timesheet_settings_${uid}` : 'timesheet_user_settings_v3';
    const saved = localStorage.getItem(key);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: UserSettings, uid?: string) {
  try {
    const key = uid ? `timesheet_settings_${uid}` : 'timesheet_user_settings_v3';
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
}

export function loadLocalEntries(uid?: string): TimesheetEntry[] {
  try {
    const key = uid ? `timesheet_entries_${uid}` : 'timesheet_entries_v3';
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading entries from localStorage', e);
  }
  return INITIAL_SAMPLE_ENTRIES;
}

export function saveLocalEntries(entries: TimesheetEntry[], uid?: string) {
  try {
    const key = uid ? `timesheet_entries_${uid}` : 'timesheet_entries_v3';
    localStorage.setItem(key, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving entries to localStorage', e);
  }
}

export function loadLocalExpenses(uid?: string): Expense[] {
  try {
    const key = uid ? `timesheet_expenses_${uid}` : 'timesheet_expenses_v3';
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading expenses from localStorage', e);
  }
  return INITIAL_SAMPLE_EXPENSES;
}

export function saveLocalExpenses(expenses: Expense[], uid?: string) {
  try {
    const key = uid ? `timesheet_expenses_${uid}` : 'timesheet_expenses_v3';
    localStorage.setItem(key, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage', e);
  }
}

// ==================== CÁC HÀM LỌC DỮ LIỆU ====================

export function filterEntries(entries: TimesheetEntry[], monthFilter: string): TimesheetEntry[] {
  return entries.filter((e) => {
    if (monthFilter === 'all') return true;
    return e.date.startsWith(monthFilter);
  });
}

export function filterExpenses(expenses: Expense[], monthFilter: string): Expense[] {
  return expenses.filter((e) => {
    if (monthFilter === 'all') return true;
    return e.date.startsWith(monthFilter);
  });
}

// ==================== TÍNH TOÁN THỐNG KÊ CÁ NHÂN ====================

export function calculateSummaryStats(
  entries: TimesheetEntry[],
  expenses: Expense[] = [],
  hourlyRate: number = 30000,
  coffeePrice: number = 30000
): SummaryStats {
  let totalEarnings = 0;
  let totalHours = 0;
  let totalBreakHours = 0;

  const datesSet = new Set<string>();
  const earningsByDate: { [date: string]: { amount: number; hours: number } } = {};

  for (const entry of entries) {
    totalEarnings += entry.totalPay || 0;
    totalHours += entry.workHours || 0;
    totalBreakHours += entry.breakHours || 0;

    datesSet.add(entry.date);
    if (!earningsByDate[entry.date]) {
      earningsByDate[entry.date] = { amount: 0, hours: 0 };
    }
    earningsByDate[entry.date].amount += entry.totalPay || 0;
    earningsByDate[entry.date].hours += entry.workHours || 0;
  }

  const totalDays = datesSet.size;
  const avgPayPerDay = totalDays > 0 ? Math.round(totalEarnings / totalDays) : 0;
  const avgHoursPerDay = totalDays > 0 ? Number((totalHours / totalDays).toFixed(1)) : 0;

  let topEarningDay: { date: string; amount: number; hours: number } | null = null;
  let topHoursDay: { date: string; hours: number; amount: number } | null = null;

  for (const [date, val] of Object.entries(earningsByDate)) {
    if (!topEarningDay || val.amount > topEarningDay.amount) {
      topEarningDay = { date, amount: val.amount, hours: val.hours };
    }
    if (!topHoursDay || val.hours > topHoursDay.hours) {
      topHoursDay = { date, hours: val.hours, amount: val.amount };
    }
  }

  // Tính chi tiêu đi làm
  let totalExpenses = 0;
  const expensesByCategory: { [key in ExpenseCategory]?: number } = {
    milktea: 0,
    coffee: 0,
    food: 0,
    gas: 0,
    parking: 0,
    snack: 0,
    other: 0,
  };

  for (const exp of expenses) {
    totalExpenses += exp.amount || 0;
    if (expensesByCategory[exp.category] !== undefined) {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    } else {
      expensesByCategory[exp.category] = exp.amount;
    }
  }

  const netEarnings = totalEarnings - totalExpenses;
  const expenseRatio = totalEarnings > 0 ? Number(((totalExpenses / totalEarnings) * 100).toFixed(1)) : 0;

  // Tính số ly cà phê quy đổi
  const coffeeCount = coffeePrice > 0 ? Math.floor(totalEarnings / coffeePrice) : 0;

  // Tính streak ngày làm liên tục
  const sortedDates = Array.from(datesSet).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const currDate = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = currDate;
    if (tempStreak > maxStreak) maxStreak = tempStreak;
  }
  currentStreak = tempStreak;

  return {
    totalEarnings,
    totalHours: Number(totalHours.toFixed(1)),
    totalDays,
    avgPayPerDay,
    avgHoursPerDay,
    topEarningDay,
    topHoursDay,
    totalBreakHours: Number(totalBreakHours.toFixed(1)),
    coffeeCount,
    currentStreak,
    maxStreak,
    totalExpenses,
    netEarnings,
    expenseRatio,
    expensesByCategory,
  };
}

export function calculateTargetProgress(totalEarnings: number, monthlyTarget: number): TargetProgress {
  const percentage = monthlyTarget > 0 ? Math.min(100, Math.round((totalEarnings / monthlyTarget) * 100)) : 0;
  const remaining = Math.max(0, monthlyTarget - totalEarnings);
  const isCompleted = totalEarnings >= monthlyTarget && monthlyTarget > 0;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const daysLeftInMonth = Math.max(1, totalDaysInMonth - today + 1);
  const dailyNeeded = remaining > 0 ? Math.round(remaining / daysLeftInMonth) : 0;

  return {
    targetAmount: monthlyTarget,
    currentAmount: totalEarnings,
    percentage,
    remaining,
    isCompleted,
    daysLeftInMonth,
    dailyNeeded,
  };
}

export function calculateDayStats(
  entries: TimesheetEntry[],
  expenses: Expense[] = [],
  monthFilter: string
): DayStatItem[] {
  const map: { [date: string]: { hours: number; earnings: number; expenses: number; count: number } } = {};

  for (const e of entries) {
    if (!map[e.date]) {
      map[e.date] = { hours: 0, earnings: 0, expenses: 0, count: 0 };
    }
    map[e.date].hours += e.workHours || 0;
    map[e.date].earnings += e.totalPay || 0;
    map[e.date].count += 1;
  }

  for (const exp of expenses) {
    if (!map[exp.date]) {
      map[exp.date] = { hours: 0, earnings: 0, expenses: 0, count: 0 };
    }
    map[exp.date].expenses += exp.amount || 0;
  }

  const sortedDates = Object.keys(map).sort();
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return sortedDates.map((date) => {
    const d = new Date(date);
    const dayOfWeek = isNaN(d.getTime()) ? '' : daysOfWeek[d.getDay()];
    const parts = date.split('-');
    const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
    const hours = Number(map[date].hours.toFixed(1));
    const earnings = map[date].earnings;
    const exp = map[date].expenses;
    const net = earnings - exp;

    return {
      date,
      displayDate,
      dayOfWeek,
      hours,
      earnings,
      expenses: exp,
      net,
      entriesCount: map[date].count,
    };
  });
}

export function calculateWeekStats(
  entries: TimesheetEntry[],
  expenses: Expense[] = [],
  monthFilter: string
): WeekStatItem[] {
  const weeks: {
    label: string;
    startDay: number;
    endDay: number;
    hours: number;
    earnings: number;
    expenses: number;
    dates: Set<string>;
  }[] = [
    { label: 'Tuần 1', startDay: 1, endDay: 7, hours: 0, earnings: 0, expenses: 0, dates: new Set() },
    { label: 'Tuần 2', startDay: 8, endDay: 14, hours: 0, earnings: 0, expenses: 0, dates: new Set() },
    { label: 'Tuần 3', startDay: 15, endDay: 21, hours: 0, earnings: 0, expenses: 0, dates: new Set() },
    { label: 'Tuần 4+', startDay: 22, endDay: 31, hours: 0, earnings: 0, expenses: 0, dates: new Set() },
  ];

  for (const e of entries) {
    const day = parseInt(e.date.split('-')[2], 10);
    if (isNaN(day)) continue;

    for (const w of weeks) {
      if (day >= w.startDay && day <= w.endDay) {
        w.hours += e.workHours || 0;
        w.earnings += e.totalPay || 0;
        w.dates.add(e.date);
        break;
      }
    }
  }

  for (const exp of expenses) {
    const day = parseInt(exp.date.split('-')[2], 10);
    if (isNaN(day)) continue;

    for (const w of weeks) {
      if (day >= w.startDay && day <= w.endDay) {
        w.expenses += exp.amount || 0;
        break;
      }
    }
  }

  return weeks.map((w) => {
    const hours = Number(w.hours.toFixed(1));
    const net = w.earnings - w.expenses;
    const startStr = String(w.startDay).padStart(2, '0');
    const endStr = String(w.endDay).padStart(2, '0');
    const monthStr = monthFilter !== 'all' && monthFilter.includes('-') ? monthFilter.split('-')[1] : '09';

    return {
      weekLabel: w.label,
      weekRange: `${startStr}/${monthStr} - ${endStr}/${monthStr}`,
      hours,
      earnings: w.earnings,
      expenses: w.expenses,
      net,
      daysWorked: w.dates.size,
    };
  });
}
