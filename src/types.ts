export interface UserProfile {
  id: string; // Unique Account ID (e.g. u_hung_123, u_lan_456)
  name: string; // Tên hiển thị người dùng (VD: "Hùng", "Lan")
  pin?: string; // Mã PIN / mật khẩu bảo mật tài khoản
  email?: string; // Email (nếu có)
  defaultHourlyRate: number; // Lương giờ mặc định
  monthlyTarget: number; // Mục tiêu tháng
  coffeePrice: number; // Giá cà phê quy đổi
  createdAt?: string;
  updatedAt?: string;
}

export interface TimesheetEntry {
  id: string;
  userId: string; // ID tài khoản sở hữu
  date: string; // YYYY-MM-DD
  timeIn?: string; // HH:mm
  timeOut?: string; // HH:mm
  breakRaw: string; // e.g. "1:40", "45p", "1.5"
  breakHours: number; // e.g. 1.67
  workHours: number; // e.g. 7.83
  hourlyRate: number; // e.g. 30000
  bonus?: number; // Tiền thưởng / phụ cấp thêm
  totalPay: number; // workHours * hourlyRate + bonus
  note?: string; // Ghi chú ca làm việc
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseCategory =
  | 'milktea' // Trà sữa 🧋
  | 'coffee' // Cà phê ☕
  | 'food' // Cơm / Ăn uống 🍔
  | 'gas' // Đổ xăng ⛽
  | 'parking' // Gửi xe 🛵
  | 'snack' // Ăn vặt 🍿
  | 'other'; // Khác 🛍️

export interface Expense {
  id: string;
  userId: string; // ID tài khoản sở hữu
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number; // Số tiền đã chi (VNĐ)
  note?: string; // Ghi chú (VD: Trà sữa trân châu, Đổ xăng đầy bình, Cơm trưa...)
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  defaultHourlyRate: number; // Mức lương / giờ mặc định (vd: 30.000đ)
  monthlyTarget: number; // Mục tiêu tháng mặc định (vd: 5.000.000đ)
  coffeePrice: number; // Giá 1 ly cà phê (vd: 30.000đ)
  selectedMonth: string; // YYYY-MM (vd: "2026-09" hoặc "all")
}

export interface SummaryStats {
  totalEarnings: number; // Tổng tiền kiếm được trong tháng (Gross)
  totalHours: number; // Tổng số giờ làm
  totalDays: number; // Tổng số ngày đi làm
  avgPayPerDay: number; // Trung bình tiền / ngày
  avgHoursPerDay: number; // Trung bình giờ / ngày
  topEarningDay: { date: string; amount: number; hours: number } | null;
  topHoursDay: { date: string; hours: number; amount: number } | null;
  totalBreakHours: number; // Tổng số giờ nghỉ
  coffeeCount: number; // Tiền kiếm tương đương số ly cà phê
  currentStreak: number; // Chuỗi ngày làm liên tiếp
  maxStreak: number;
  totalExpenses: number; // Tổng chi tiêu đi làm (Trà sữa, ăn uống, xăng xe...)
  netEarnings: number; // Tiền thực nhận ròng (Tổng tiền kiếm - Chi tiêu đi làm)
  expenseRatio: number; // % chi tiêu đi làm so với thu nhập
  expensesByCategory: { [key in ExpenseCategory]?: number };
}

export interface DayStatItem {
  date: string; // YYYY-MM-DD
  displayDate: string; // DD/MM
  dayOfWeek: string; // T2, T3, ...
  hours: number;
  earnings: number;
  expenses: number;
  net: number;
  entriesCount: number;
}

export interface WeekStatItem {
  weekLabel: string; // "Tuần 1", "Tuần 2"...
  weekRange: string; // "01/09 - 07/09"
  hours: number;
  earnings: number;
  expenses: number;
  net: number;
  daysWorked: number;
}

export interface TargetProgress {
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  remaining: number;
  isCompleted: boolean;
  daysLeftInMonth: number;
  dailyNeeded: number;
}
