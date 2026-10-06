import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardSheet } from './components/DashboardSheet';
import { TimesheetSheet } from './components/TimesheetSheet';
import { ExpensesSheet } from './components/ExpensesSheet';
import { SettingsModal } from './components/SettingsModal';
import { SalarySlipModal } from './components/SalarySlipModal';
import { AuthModal } from './components/AuthModal';
import { Expense, TimesheetEntry, UserProfile, UserSettings } from './types';
import {
  calculateDayStats,
  calculateSummaryStats,
  calculateTargetProgress,
  calculateWeekStats,
  DEFAULT_SETTINGS,
  filterEntries,
  filterExpenses,
  INITIAL_SAMPLE_ENTRIES,
  INITIAL_SAMPLE_EXPENSES,
  loadLocalEntries,
  loadLocalExpenses,
  loadLocalSettings,
  saveLocalEntries,
  saveLocalExpenses,
  saveLocalSettings,
} from './utils/storage';
import { exportExpensesToCSV, exportToCSV } from './utils/exportCsv';
import {
  deleteUserEntryFromCloud,
  deleteUserExpenseFromCloud,
  getAccountDoc,
  saveUserEntryToCloud,
  saveUserExpenseToCloud,
  saveUserProfileToCloud,
  subscribeToUserEntries,
  subscribeToUserExpenses,
  subscribeToUserProfile,
  testConnection,
} from './firebase';

const STORAGE_ACTIVE_USER_KEY = 'chamcong_active_user_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read cached user', e);
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] = useState<'timesheet' | 'expenses' | 'dashboard'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSalarySlipOpen, setIsSalarySlipOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');

  // Kiểm tra kết nối Firestore lúc boot
  useEffect(() => {
    testConnection().then((connected) => {
      setCloudStatus(connected ? 'connected' : 'offline');
    });
  }, []);

  // Nếu chưa có tài khoản đăng nhập lúc mở app -> mở modal đăng nhập
  useEffect(() => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      // Nạp dữ liệu offline mẫu hiển thị tạm thời
      setEntries(loadLocalEntries('default'));
      setExpenses(loadLocalExpenses('default'));
      setSettings(loadLocalSettings('default'));
    }
  }, [currentUser]);

  // Quản lý đồng bộ Firestore theo ID tài khoản hiện tại
  useEffect(() => {
    if (!currentUser?.id) return;

    const uid = currentUser.id;

    // Nạp cache local của tài khoản này
    const cachedSettings = loadLocalSettings(uid);
    const cachedEntries = loadLocalEntries(uid);
    const cachedExpenses = loadLocalExpenses(uid);
    setSettings(cachedSettings);
    setEntries(cachedEntries);
    setExpenses(cachedExpenses);

    // 1. Lắng nghe Profile & Cài đặt từ Firestore (/users/{uid})
    const unsubProfile = subscribeToUserProfile(
      uid,
      (cloudProfile) => {
        if (cloudProfile) {
          setCurrentUser((prev) => (prev ? { ...prev, ...cloudProfile } : null));
          setSettings((prev) => ({
            ...prev,
            defaultHourlyRate: cloudProfile.defaultHourlyRate ?? prev.defaultHourlyRate,
            monthlyTarget: cloudProfile.monthlyTarget ?? prev.monthlyTarget,
            coffeePrice: cloudProfile.coffeePrice ?? prev.coffeePrice,
          }));
        }
      },
      (err) => console.warn('Sync profile err', err)
    );

    // 2. Lắng nghe Ca Chấm Công (/users/{uid}/entries)
    const unsubEntries = subscribeToUserEntries(
      uid,
      (cloudEntries) => {
        setCloudStatus('connected');
        if (cloudEntries.length === 0 && cachedEntries.length === 0) {
          // Lần đầu sử dụng: tự động thêm mẫu ca làm việc để người dùng trải nghiệm ngay
          INITIAL_SAMPLE_ENTRIES.forEach((sample) => {
            const item = { ...sample, userId: uid };
            saveUserEntryToCloud(uid, item).catch(() => {});
          });
          setEntries(INITIAL_SAMPLE_ENTRIES.map((s) => ({ ...s, userId: uid })));
          saveLocalEntries(INITIAL_SAMPLE_ENTRIES.map((s) => ({ ...s, userId: uid })), uid);
        } else {
          setEntries(cloudEntries);
          saveLocalEntries(cloudEntries, uid);
        }
      },
      (err) => console.warn('Sync entries err', err)
    );

    // 3. Lắng nghe Chi Tiêu Đi Làm (/users/{uid}/expenses)
    const unsubExpenses = subscribeToUserExpenses(
      uid,
      (cloudExpenses) => {
        setCloudStatus('connected');
        if (cloudExpenses.length === 0 && cachedExpenses.length === 0) {
          // Lần đầu sử dụng: tự động thêm mẫu chi tiêu đi làm (trà sữa, cơm, xăng)
          INITIAL_SAMPLE_EXPENSES.forEach((sample) => {
            const item = { ...sample, userId: uid };
            saveUserExpenseToCloud(uid, item).catch(() => {});
          });
          setExpenses(INITIAL_SAMPLE_EXPENSES.map((s) => ({ ...s, userId: uid })));
          saveLocalExpenses(INITIAL_SAMPLE_EXPENSES.map((s) => ({ ...s, userId: uid })), uid);
        } else {
          setExpenses(cloudExpenses);
          saveLocalExpenses(cloudExpenses, uid);
        }
      },
      (err) => console.warn('Sync expenses err', err)
    );

    return () => {
      unsubProfile();
      unsubEntries();
      unsubExpenses();
    };
  }, [currentUser?.id]);

  // Danh sách các tháng có dữ liệu ca làm việc hoặc chi tiêu
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        set.add(e.date.substring(0, 7));
      }
    });
    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        set.add(e.date.substring(0, 7));
      }
    });
    set.add('2026-09');
    return Array.from(set).sort().reverse();
  }, [entries, expenses]);

  // Lọc dữ liệu theo tháng đã chọn
  const filteredEntries = useMemo(() => {
    return filterEntries(entries, selectedMonth);
  }, [entries, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    return filterExpenses(expenses, selectedMonth);
  }, [expenses, selectedMonth]);

  // Thống kê cá nhân
  const stats = useMemo(() => {
    return calculateSummaryStats(
      filteredEntries,
      filteredExpenses,
      settings.defaultHourlyRate,
      settings.coffeePrice
    );
  }, [filteredEntries, filteredExpenses, settings]);

  const targetProgress = useMemo(() => {
    return calculateTargetProgress(stats.totalEarnings, settings.monthlyTarget);
  }, [stats.totalEarnings, settings.monthlyTarget]);

  const dailyStats = useMemo(() => {
    return calculateDayStats(filteredEntries, filteredExpenses, selectedMonth);
  }, [filteredEntries, filteredExpenses, selectedMonth]);

  const weeklyStats = useMemo(() => {
    return calculateWeekStats(filteredEntries, filteredExpenses, selectedMonth);
  }, [filteredEntries, filteredExpenses, selectedMonth]);

  // ==================== CÁC HÀM XỬ LÝ CHẤM CÔNG ====================
  const handleAddEntry = async (entryData: Omit<TimesheetEntry, 'id'>) => {
    const uid = currentUser?.id || 'local';
    const newEntry: TimesheetEntry = {
      ...entryData,
      id: `ts-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: uid,
      createdAt: new Date().toISOString(),
    };

    const nextList = [newEntry, ...entries];
    setEntries(nextList);
    saveLocalEntries(nextList, uid);

    if (currentUser?.id) {
      try {
        await saveUserEntryToCloud(uid, newEntry);
      } catch (err) {
        console.error('Error saving entry to Firestore', err);
      }
    }
  };

  const handleUpdateEntry = async (id: string, entryData: Partial<TimesheetEntry>) => {
    const uid = currentUser?.id || 'local';
    const nextList = entries.map((e) => (e.id === id ? { ...e, ...entryData } : e));
    setEntries(nextList);
    saveLocalEntries(nextList, uid);

    const updated = nextList.find((e) => e.id === id);
    if (updated && currentUser?.id) {
      try {
        await saveUserEntryToCloud(uid, updated);
      } catch (err) {
        console.error('Error updating entry to Firestore', err);
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const uid = currentUser?.id || 'local';
    const nextList = entries.filter((e) => e.id !== id);
    setEntries(nextList);
    saveLocalEntries(nextList, uid);

    if (currentUser?.id) {
      try {
        await deleteUserEntryFromCloud(uid, id);
      } catch (err) {
        console.error('Error deleting entry from Firestore', err);
      }
    }
  };

  const handleDuplicateEntry = (entry: TimesheetEntry) => {
    const today = new Date().toISOString().split('T')[0];
    handleAddEntry({
      userId: currentUser?.id || '',
      date: today,
      timeIn: entry.timeIn,
      timeOut: entry.timeOut,
      breakRaw: entry.breakRaw,
      breakHours: entry.breakHours,
      workHours: entry.workHours,
      hourlyRate: entry.hourlyRate,
      bonus: entry.bonus,
      totalPay: entry.totalPay,
      note: entry.note ? `${entry.note} (sao chép)` : 'Ca làm sao chép',
    });
  };

  // ==================== CÁC HÀM XỬ LÝ CHI TIÊU ĐI LÀM ====================
  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const uid = currentUser?.id || 'local';
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: uid,
      createdAt: new Date().toISOString(),
    };

    const nextList = [newExpense, ...expenses];
    setExpenses(nextList);
    saveLocalExpenses(nextList, uid);

    if (currentUser?.id) {
      try {
        await saveUserExpenseToCloud(uid, newExpense);
      } catch (err) {
        console.error('Error saving expense to Firestore', err);
      }
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: Partial<Expense>) => {
    const uid = currentUser?.id || 'local';
    const nextList = expenses.map((e) => (e.id === id ? { ...e, ...expenseData } : e));
    setExpenses(nextList);
    saveLocalExpenses(nextList, uid);

    const updated = nextList.find((e) => e.id === id);
    if (updated && currentUser?.id) {
      try {
        await saveUserExpenseToCloud(uid, updated);
      } catch (err) {
        console.error('Error updating expense to Firestore', err);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const uid = currentUser?.id || 'local';
    const nextList = expenses.filter((e) => e.id !== id);
    setExpenses(nextList);
    saveLocalExpenses(nextList, uid);

    if (currentUser?.id) {
      try {
        await deleteUserExpenseFromCloud(uid, id);
      } catch (err) {
        console.error('Error deleting expense from Firestore', err);
      }
    }
  };

  // ==================== CÀI ĐẶT & HỒ SƠ ====================
  const handleSaveSettings = async (newSettings: UserSettings, displayName?: string) => {
    const uid = currentUser?.id || 'local';
    setSettings(newSettings);
    saveLocalSettings(newSettings, uid);

    if (currentUser?.id) {
      try {
        const updateData: Partial<UserProfile> = {
          defaultHourlyRate: newSettings.defaultHourlyRate,
          monthlyTarget: newSettings.monthlyTarget,
          coffeePrice: newSettings.coffeePrice,
        };
        if (displayName) {
          updateData.name = displayName;
        }
        await saveUserProfileToCloud(uid, updateData);
        if (displayName) {
          setCurrentUser((prev) => (prev ? { ...prev, name: displayName } : null));
          const updatedUser = { ...currentUser, name: displayName };
          localStorage.setItem(STORAGE_ACTIVE_USER_KEY, JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error('Error saving settings to Firestore', err);
      }
    }
  };

  const handleLoginSuccess = (account: UserProfile) => {
    setCurrentUser(account);
    try {
      localStorage.setItem(STORAGE_ACTIVE_USER_KEY, JSON.stringify(account));
    } catch (e) {
      console.warn('Could not save active user to local storage', e);
    }
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_ACTIVE_USER_KEY);
    } catch (e) {
      console.warn('Could not remove active user', e);
    }
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // Xuất file CSV / Excel
  const handleExportCSV = () => {
    if (activeTab === 'expenses') {
      exportExpensesToCSV(
        filteredExpenses,
        `chi_tieu_di_lam_${selectedMonth !== 'all' ? selectedMonth : 'tat_ca'}.csv`
      );
    } else {
      exportToCSV(
        filteredEntries,
        `cham_cong_ca_nhan_${selectedMonth !== 'all' ? selectedMonth : 'tat_ca'}.csv`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased font-sans flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          availableMonths={availableMonths}
          cloudStatus={cloudStatus}
          currentUser={currentUser}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSalarySlip={() => setIsSalarySlipOpen(true)}
          onExportCSV={handleExportCSV}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Nội dung chính theo Sheet */}
        <main className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {activeTab === 'timesheet' && (
            <TimesheetSheet
              entries={filteredEntries}
              settings={settings}
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              onDuplicateEntry={handleDuplicateEntry}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesSheet
              expenses={filteredExpenses}
              settings={settings}
              totalEarnings={stats.totalEarnings}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardSheet
              stats={stats}
              targetProgress={targetProgress}
              dailyStats={dailyStats}
              weeklyStats={weeklyStats}
              settings={settings}
              onOpenSalarySlip={() => setIsSalarySlipOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-12 text-center text-xs text-slate-400">
        <p>
          Sổ Chấm Công & Quản Lý Chi Tiêu Đi Làm Cá Nhân • Dữ liệu riêng tư trên đám mây Firestore
        </p>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        currentUser={currentUser}
        onSave={handleSaveSettings}
        onLogout={handleLogout}
      />

      <SalarySlipModal
        isOpen={isSalarySlipOpen}
        onClose={() => setIsSalarySlipOpen(false)}
        currentUser={currentUser}
        selectedMonth={selectedMonth}
        entries={filteredEntries}
        expenses={filteredExpenses}
        stats={stats}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => {
          if (currentUser) setIsAuthModalOpen(false);
        }}
        canDismiss={!!currentUser}
      />
    </div>
  );
}
