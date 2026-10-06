import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Expense, TimesheetEntry, UserProfile } from './types';

// Khởi tạo Firebase App & Firestore với database ID đã cấp phát
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Kiểm tra kết nối Firestore lúc khởi động ứng dụng
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable. Using local cache.');
    }
    return false;
  }
}

// ==================== QUẢN LÝ TÀI KHOẢN CÁ NHÂN (/users/{userId}) ====================

/**
 * Lấy danh sách tài khoản đã có để gợi ý đăng nhập nhanh
 */
export async function getExistingAccounts(): Promise<Array<{ id: string; name: string }>> {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    const list: Array<{ id: string; name: string }> = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({ id: d.id, name: data.name || d.id });
    });
    return list;
  } catch (err) {
    console.warn('Could not fetch account list from cloud, using local fallback', err);
    return [];
  }
}

/**
 * Lấy chi tiết tài khoản theo ID
 */
export async function getAccountDoc(userId: string): Promise<UserProfile | null> {
  try {
    const dSnap = await getDoc(doc(db, 'users', userId));
    if (dSnap.exists()) {
      return { id: dSnap.id, ...(dSnap.data() as Omit<UserProfile, 'id'>) };
    }
  } catch (err) {
    console.error('Error getting account doc', err);
  }
  return null;
}

/**
 * Tạo tài khoản cá nhân mới
 */
export async function createPersonalAccount(
  name: string,
  pin: string = '',
  defaultHourlyRate: number = 30000,
  monthlyTarget: number = 5000000
): Promise<UserProfile> {
  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const userId = `u_${cleanName || 'user'}_${randomSuffix}`;

  const profile: UserProfile = {
    id: userId,
    name: name.trim() || 'Tài khoản của tôi',
    pin: pin.trim(),
    defaultHourlyRate,
    monthlyTarget,
    coffeePrice: 30000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', userId), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    // If Firestore fails, still return profile for local usage
  }
  return profile;
}

/**
 * Lắng nghe thông tin tài khoản cá nhân
 */
export function subscribeToUserProfile(
  userId: string,
  onSuccess: (profile: Partial<UserProfile>) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    doc(db, 'users', userId),
    (docSnap) => {
      if (docSnap.exists()) {
        onSuccess(docSnap.data() as Partial<UserProfile>);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      if (onError) onError(error);
    }
  );
}

/**
 * Cập nhật thông tin tài khoản cá nhân
 */
export async function saveUserProfileToCloud(userId: string, data: Partial<UserProfile>) {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...data,
        id: userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    throw error;
  }
}

// ==================== CA CHẤM CÔNG CÁ NHÂN (/users/{userId}/entries) ====================

export function subscribeToUserEntries(
  userId: string,
  onSuccess: (entries: TimesheetEntry[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'users', userId, 'entries');
  const q = query(colRef);
  return onSnapshot(
    q,
    (snapshot) => {
      const list: TimesheetEntry[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<TimesheetEntry, 'id'>) });
      });
      onSuccess(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/entries`);
      if (onError) onError(error);
    }
  );
}

export async function saveUserEntryToCloud(userId: string, entry: TimesheetEntry) {
  try {
    await setDoc(doc(db, 'users', userId, 'entries', entry.id), {
      userId,
      date: entry.date,
      timeIn: entry.timeIn || '',
      timeOut: entry.timeOut || '',
      breakRaw: entry.breakRaw || '0',
      breakHours: entry.breakHours || 0,
      workHours: entry.workHours || 0,
      hourlyRate: entry.hourlyRate || 30000,
      bonus: entry.bonus || 0,
      totalPay: entry.totalPay || 0,
      note: entry.note || '',
      id: entry.id,
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/entries/${entry.id}`);
    throw error;
  }
}

export async function deleteUserEntryFromCloud(userId: string, entryId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'entries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/entries/${entryId}`);
    throw error;
  }
}

// ==================== CHI TIÊU ĐI LÀM CÁ NHÂN (/users/{userId}/expenses) ====================

export function subscribeToUserExpenses(
  userId: string,
  onSuccess: (expenses: Expense[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'users', userId, 'expenses');
  const q = query(colRef);
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Expense, 'id'>) });
      });
      onSuccess(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/expenses`);
      if (onError) onError(error);
    }
  );
}

export async function saveUserExpenseToCloud(userId: string, exp: Expense) {
  try {
    await setDoc(doc(db, 'users', userId, 'expenses', exp.id), {
      userId,
      date: exp.date,
      category: exp.category,
      amount: exp.amount,
      note: exp.note || '',
      id: exp.id,
      createdAt: exp.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/expenses/${exp.id}`);
    throw error;
  }
}

export async function deleteUserExpenseFromCloud(userId: string, expenseId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/expenses/${expenseId}`);
    throw error;
  }
}
