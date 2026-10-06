import React, { useState } from 'react';
import { Settings, X, DollarSign, Target, Coffee, User as UserIcon, LogOut } from 'lucide-react';
import { UserProfile, UserSettings } from '../types';
import { formatVND } from '../utils/timeParser';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  currentUser: UserProfile | null;
  onSave: (newSettings: UserSettings, displayName?: string) => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentUser,
  onSave,
  onLogout,
}) => {
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [hourlyRate, setHourlyRate] = useState(settings.defaultHourlyRate.toString());
  const [target, setTarget] = useState(settings.monthlyTarget.toString());
  const [coffee, setCoffee] = useState(settings.coffeePrice.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        ...settings,
        defaultHourlyRate: Math.max(1000, parseInt(hourlyRate, 10) || 30000),
        monthlyTarget: Math.max(100000, parseInt(target, 10) || 5000000),
        coffeePrice: Math.max(5000, parseInt(coffee, 10) || 30000),
      },
      displayName.trim()
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        id="settings-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base sm:text-lg">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Cài đặt sổ cá nhân của bạn</span>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tên hiển thị */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              Tên của bạn
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 text-xs font-medium"
              placeholder="VD: Hùng, Minh Anh..."
            />
            {currentUser?.email && (
              <p className="text-[11px] text-slate-400 mt-1">
                Tài khoản đăng nhập: <strong className="text-slate-600">{currentUser.email}</strong>
              </p>
            )}
          </div>

          {/* Lương theo giờ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Mức lương cơ bản / giờ (VNĐ)
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                {formatVND(parseInt(hourlyRate, 10) || 0)}/h
              </span>
            </label>
            <input
              type="number"
              step="1000"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 text-xs font-medium"
              placeholder="VD: 30000"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Được tự động điền sẵn khi bạn tạo ca làm việc mới.
            </p>
          </div>

          {/* Mục tiêu tháng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                Mục tiêu thu nhập tháng (VNĐ)
              </span>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                {formatVND(parseInt(target, 10) || 0)}
              </span>
            </label>
            <input
              type="number"
              step="100000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 text-xs font-medium"
              placeholder="VD: 5000000"
              required
            />
          </div>

          {/* Giá 1 ly cà phê */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                Giá 1 ly cà phê (Quy đổi vui)
              </span>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                {formatVND(parseInt(coffee, 10) || 0)}/ly
              </span>
            </label>
            <input
              type="number"
              step="1000"
              value={coffee}
              onChange={(e) => setCoffee(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 text-xs font-medium"
              placeholder="VD: 30000"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
