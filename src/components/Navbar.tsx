import React from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Cloud,
  FileText,
  Wallet,
  LayoutDashboard,
  Settings as SettingsIcon,
  Download,
  LogOut,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'timesheet' | 'expenses' | 'dashboard';
  setActiveTab: (tab: 'timesheet' | 'expenses' | 'dashboard') => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];
  cloudStatus: 'connected' | 'connecting' | 'offline';
  currentUser: UserProfile | null;
  onOpenSettings: () => void;
  onOpenSalarySlip: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  cloudStatus,
  currentUser,
  onOpenSettings,
  onOpenSalarySlip,
  onExportCSV,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Personal Workspace Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              
              <p className="text-[11px] font-medium text-slate-600 hidden xs:block">
                Tự chấm công • Quản lý chi tiêu trà sữa, đổ xăng
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab('timesheet')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'timesheet'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Chấm công</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Chi tiêu</span>
              <span className="ml-0.5 rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-extrabold text-amber-800">
                🧋
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="">Thống kê</span>
              
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Month Filter Selector */}
            <div className="relative hidden md:block">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-7 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                <option value="all">📅 Tất cả các tháng</option>
                {availableMonths.map((m) => {
                  const parts = m.split('-');
                  const label = parts.length === 2 ? `Tháng ${parts[1]}/${parts[0]}` : m;
                  return (
                    <option key={m} value={m}>
                      📅 {label}
                    </option>
                  );
                })}
              </select>
              <Calendar className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Quick Salary Slip Button */}
            <button
              onClick={onOpenSalarySlip}
              title="Xem và in Phiếu Báo Lương Cá Nhân"
              className="hidden lg:flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-600" />
              <span>Phiếu lương</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={onExportCSV}
              title="Xuất file Excel / CSV dữ liệu cá nhân"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            {/* Cloud Status indicator */}
            {/* <div
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700'
                  : cloudStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-700 animate-pulse'
                  : 'bg-rose-50 text-rose-700'
              }`}
              title={
                cloudStatus === 'connected'
                  ? 'Đã đồng bộ thời gian thực với Firebase'
                  : 'Đang kết nối đám mây...'
              }
            >
              <Cloud className="h-3 w-3" />
              <span className="capitalize">{cloudStatus === 'connected' ? 'Cloud Sync' : cloudStatus}</span>
            </div> */}

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Cài đặt mức lương & mục tiêu cá nhân"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>

            {/* User Account / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                <div
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 rounded-full py-1 pl-1 pr-2.5 transition-colors cursor-pointer"
                  onClick={onOpenSettings}
                  title="Nhấn để đổi cài đặt cá nhân"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white shadow-xs">
                    {(currentUser.name || 'Tôi').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[120px] truncate text-xs font-bold text-slate-800">
                    {currentUser.name || 'Tài khoản'}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Đăng xuất khỏi tài khoản"
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
