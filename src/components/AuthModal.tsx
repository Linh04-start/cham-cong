import React, { useState, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  Lock,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  Wallet,
  Zap,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { createPersonalAccount, getAccountDoc, getExistingAccounts } from '../firebase';
import { formatVND } from '../utils/timeParser';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onLoginSuccess,
  onClose,
  canDismiss = false,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [hourlyRate, setHourlyRate] = useState('30000');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Danh sách tài khoản có sẵn
  const [existingAccounts, setExistingAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  useEffect(() => {
    if (isOpen) {
      getExistingAccounts().then((list) => {
        setExistingAccounts(list);
        if (list.length > 0) {
          setSelectedAccountId(list[0].id);
        } else {
          setIsRegister(true);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên của bạn.');
      return;
    }

    setIsLoading(true);
    try {
      const rate = parseInt(hourlyRate, 10) || 30000;
      const account = await createPersonalAccount(name.trim(), pin.trim(), rate);
      onLoginSuccess(account);
      if (onClose) onClose();
    } catch (err: unknown) {
      console.error('Error creating account', err);
      setErrorMsg('Không thể tạo tài khoản: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedAccountId) {
      setErrorMsg('Vui lòng chọn tài khoản để đăng nhập.');
      return;
    }

    setIsLoading(true);
    try {
      const acc = await getAccountDoc(selectedAccountId);
      if (!acc) {
        setErrorMsg('Không tìm thấy tài khoản này trong hệ thống.');
        setIsLoading(false);
        return;
      }

      if (acc.pin && acc.pin !== pin.trim()) {
        setErrorMsg('Mã PIN không chính xác. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(acc);
      if (onClose) onClose();
    } catch (err: unknown) {
      console.error('Login error', err);
      setErrorMsg('Lỗi đăng nhập: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGuest = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const guestAccount = await createPersonalAccount('Tôi (Cá nhân)', '', 30000, 5000000);
      onLoginSuccess(guestAccount);
      if (onClose) onClose();
    } catch (err: unknown) {
      console.error('Quick trial error', err);
      setErrorMsg('Không thể tạo tài khoản dùng thử.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-2 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="relative my-auto w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 max-h-[calc(100dvh-1rem)]">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-5 text-center text-white sm:px-6 sm:py-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">Sổ Chấm Công & Chi Tiêu Cá Nhân</h2>
          <p className="mt-1 text-xs text-emerald-100">
            Dữ liệu riêng tư tuyệt đối • Tài khoản của ai thì chỉ người đó xem của mình
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
            <span>Không có quản lý / sếp nào quản lý</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold transition-colors ${
              !isRegister
                ? 'border-b-2 border-emerald-600 bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <LogIn className="h-4 w-4" />
              Đăng nhập tài khoản
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold transition-colors ${
              isRegister
                ? 'border-b-2 border-emerald-600 bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <UserPlus className="h-4 w-4" />
              Tạo tài khoản mới
            </span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6">
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 ring-1 ring-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isRegister ? (
            /* FORM TẠO TÀI KHOẢN MỚI */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên của bạn <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Hùng, Minh Anh, Lan..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mã PIN bảo vệ (Tùy chọn)</span>
                  <span className="text-[11px] text-slate-400">4-6 số hoặc để trống</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="VD: 1234 (để khóa tài khoản của bạn)"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mức lương cơ bản / giờ (VNĐ)</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {formatVND(parseInt(hourlyRate, 10) || 0)}/h
                  </span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="1000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="VD: 30000"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-600 py-2.5 px-4 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Tạo Tài Khoản & Bắt Đầu Ngay
                  </>
                )}
              </button>
            </form>
          ) : (
            /* FORM ĐĂNG NHẬP */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn tài khoản của bạn
                </label>
                {existingAccounts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                    Chưa có tài khoản nào được tạo. Bạn hãy chuyển sang tab{' '}
                    <strong
                      onClick={() => setIsRegister(true)}
                      className="text-emerald-600 cursor-pointer underline"
                    >
                      &quot;Tạo tài khoản mới&quot;
                    </strong>
                    .
                  </div>
                ) : (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm font-bold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white cursor-pointer"
                  >
                    {existingAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        👤 {acc.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mã PIN (nếu có đặt)</span>
                  <span className="text-[11px] text-slate-400">Nếu chưa đặt thì để trống</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Nhập mã PIN để vào sổ"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || existingAccounts.length === 0}
                className="w-full rounded-xl bg-emerald-600 py-2.5 px-4 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Đăng Nhập Vào Sổ Của Tôi
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Trial Option */}
          <div className="mt-5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleQuickGuest}
              disabled={isLoading}
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 py-2.5 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Vào Nhanh Ngay (Tài Khoản Cá Nhân Mặc Định)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
