import { Expense, TimesheetEntry } from '../types';
import { getDayOfWeekShort } from './timeParser';

/**
 * Xuất dữ liệu chấm công cá nhân ra file CSV tương thích hoàn hảo với Microsoft Excel
 * (Sử dụng UTF-8 BOM \uFEFF để không bị lỗi font tiếng Việt)
 */
export function exportToCSV(
  entries: TimesheetEntry[],
  fileName: string = 'cham_cong_ca_nhan.csv'
) {
  const headers = [
    'Ngày',
    'Thứ',
    'Giờ vào',
    'Giờ ra',
    'Giờ nghỉ',
    'Giờ làm thực tế (h)',
    'Lương theo giờ (VNĐ)',
    'Thưởng / Phụ cấp (VNĐ)',
    'Tổng tiền công (VNĐ)',
    'Ghi chú',
  ];

  const rows = entries.map((e) => [
    e.date,
    getDayOfWeekShort(e.date),
    e.timeIn || '',
    e.timeOut || '',
    `"${e.breakRaw || ''}"`,
    e.workHours,
    e.hourlyRate,
    e.bonus || 0,
    e.totalPay,
    `"${(e.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất chi tiêu đi làm ra CSV
 */
export function exportExpensesToCSV(
  expenses: Expense[],
  fileName: string = 'chi_tieu_di_lam.csv'
) {
  const categoryNames: Record<string, string> = {
    milktea: 'Trà sữa 🧋',
    coffee: 'Cà phê ☕',
    food: 'Cơm / Ăn uống 🍔',
    gas: 'Đổ xăng ⛽',
    parking: 'Gửi xe 🛵',
    snack: 'Ăn vặt 🍿',
    other: 'Khác 🛍️',
  };

  const headers = ['Ngày', 'Danh mục', 'Số tiền (VNĐ)', 'Ghi chú'];
  const rows = expenses.map((exp) => [
    exp.date,
    `"${categoryNames[exp.category] || exp.category}"`,
    exp.amount,
    `"${(exp.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
