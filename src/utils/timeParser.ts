/**
 * Tiện ích xử lý thời gian, tính giờ nghỉ và định dạng tiền tệ
 */

export interface ParseBreakResult {
  hours: number;
  minutes: number;
  totalMinutes: number;
  decimalHours: number;
  displayText: string;
}

/**
 * Tự động phân tích chuỗi giờ nghỉ:
 * - "1:40" -> 1 giờ 40 phút = 100 phút = 1.67 giờ
 * - "0:45" -> 45 phút = 0.75 giờ
 * - "1h30" / "1h30p" -> 1 giờ 30 phút = 1.5 giờ
 * - "45" / "45p" -> 45 phút
 * - "1.5" / "1,5" -> 1.5 giờ = 1 giờ 30 phút
 */
export function parseBreakTime(input: string): ParseBreakResult {
  if (!input || typeof input !== 'string') {
    return { hours: 0, minutes: 0, totalMinutes: 0, decimalHours: 0, displayText: '0 phút' };
  }

  const raw = input.trim().toLowerCase().replace(',', '.');
  if (!raw) {
    return { hours: 0, minutes: 0, totalMinutes: 0, decimalHours: 0, displayText: '0 phút' };
  }

  // Kiểu "1:40" hoặc "01:40"
  if (raw.includes(':')) {
    const parts = raw.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const totalM = h * 60 + m;
    const decH = Math.round((totalM / 60) * 100) / 100;
    return {
      hours: h,
      minutes: m,
      totalMinutes: totalM,
      decimalHours: decH,
      displayText: `${h > 0 ? `${h}h ` : ''}${m}p (${decH}h)`,
    };
  }

  // Kiểu "1h40" hoặc "1h40p" hoặc "1h"
  const hMatch = raw.match(/^(\d+)\s*h\s*(\d+)?/);
  if (hMatch) {
    const h = parseInt(hMatch[1], 10) || 0;
    const m = parseInt(hMatch[2], 10) || 0;
    const totalM = h * 60 + m;
    const decH = Math.round((totalM / 60) * 100) / 100;
    return {
      hours: h,
      minutes: m,
      totalMinutes: totalM,
      decimalHours: decH,
      displayText: `${h > 0 ? `${h}h ` : ''}${m}p (${decH}h)`,
    };
  }

  // Kiểu có chữ "p" hoặc "m" như "45p", "30phut"
  const pMatch = raw.match(/^(\d+)\s*(p|ph|phut|m|min)?$/);
  if (pMatch && raw.includes('p')) {
    const m = parseInt(pMatch[1], 10) || 0;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    const decH = Math.round((m / 60) * 100) / 100;
    return {
      hours: h,
      minutes: remM,
      totalMinutes: m,
      decimalHours: decH,
      displayText: `${h > 0 ? `${h}h ` : ''}${remM}p (${decH}h)`,
    };
  }

  // Kiểu số thập phân: "1.5" -> 1.5h = 90 phút
  if (!isNaN(Number(raw))) {
    const num = parseFloat(raw);
    // Nếu số >= 15 và là số nguyên thì khả năng là số phút (ví dụ nhập 30, 45, 60)
    if (Number.isInteger(num) && num >= 15) {
      const h = Math.floor(num / 60);
      const m = num % 60;
      const decH = Math.round((num / 60) * 100) / 100;
      return {
        hours: h,
        minutes: m,
        totalMinutes: num,
        decimalHours: decH,
        displayText: `${h > 0 ? `${h}h ` : ''}${m}p (${decH}h)`,
      };
    } else {
      // Coi là số giờ thập phân (ví dụ 1.5 = 1h30p)
      const totalM = Math.round(num * 60);
      const h = Math.floor(totalM / 60);
      const m = totalM % 60;
      return {
        hours: h,
        minutes: m,
        totalMinutes: totalM,
        decimalHours: Math.round(num * 100) / 100,
        displayText: `${h > 0 ? `${h}h ` : ''}${m}p (${num}h)`,
      };
    }
  }

  return { hours: 0, minutes: 0, totalMinutes: 0, decimalHours: 0, displayText: raw };
}

/**
 * Tính số giờ làm thực tế từ giờ vào, giờ ra và giờ nghỉ
 */
export function calculateWorkHours(
  timeIn: string,
  timeOut: string,
  breakRaw: string
): { workHours: number; totalDurationHours: number; breakHours: number } {
  const breakInfo = parseBreakTime(breakRaw);
  const breakHours = breakInfo.decimalHours;

  if (!timeIn || !timeOut) {
    return { workHours: 0, totalDurationHours: 0, breakHours };
  }

  const [inH, inM] = timeIn.split(':').map(Number);
  const [outH, outM] = timeOut.split(':').map(Number);

  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) {
    return { workHours: 0, totalDurationHours: 0, breakHours };
  }

  let inMinutes = inH * 60 + inM;
  let outMinutes = outH * 60 + outM;

  // Xử lý ca qua đêm (ví dụ 22:00 -> 06:00 sáng hôm sau)
  if (outMinutes < inMinutes) {
    outMinutes += 24 * 60;
  }

  const durationMinutes = outMinutes - inMinutes;
  const durationHours = Math.round((durationMinutes / 60) * 100) / 100;

  const actualWorkMinutes = Math.max(0, durationMinutes - breakInfo.totalMinutes);
  const workHours = Math.round((actualWorkMinutes / 60) * 100) / 100;

  return {
    workHours,
    totalDurationHours: durationHours,
    breakHours,
  };
}

/**
 * Định dạng tiền tệ VNĐ (ví dụ: 235.000đ, 2.760.000đ)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0đ';
  const rounded = Math.round(amount);
  return `${new Intl.NumberFormat('vi-VN').format(rounded)}đ`;
}

/**
 * Định dạng số giờ (ví dụ: 7,83h hoặc 8,00h)
 */
export function formatHours(hours: number): string {
  if (isNaN(hours)) return '0h';
  const formatted = hours.toFixed(2).replace('.', ',');
  return `${formatted}h`;
}

/**
 * Lấy tên thứ trong tuần viết tắt (T2, T3, ... CN)
 */
export function getDayOfWeekShort(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = date.getDay();
  const map: Record<number, string> = {
    0: 'CN',
    1: 'T2',
    2: 'T3',
    3: 'T4',
    4: 'T5',
    5: 'T6',
    6: 'T7',
  };
  return map[day] || '';
}

/**
 * Định dạng ngày DD/MM (ví dụ 15/09)
 */
export function formatDayMonth(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

/**
 * Định dạng ngày đầy đủ DD/MM/YYYY
 */
export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
