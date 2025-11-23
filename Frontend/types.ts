export type Role = 'admin' | 'student';

export type TransactionType = 'deposit' | 'withdrawal';

export interface User {
  id: string; 
  name: string;
  username: string;
  role: Role;
}

export interface Admin {
  _id?: string; 
  id?: number | string;
  name: string;
  username: string;
  password?: string;
  role: 'admin';
  createdAt?: string;
}

export interface Student {
  _id?: string;
  id?: number | string; 
  name: string;
  username: string;
  password?: string;
  accountBalance: number;
  createdAt: string;
}

export interface ClassEntity {
  _id?: string;
  id?: number | string;
  name: string;
  accountBalance: number;
  createdAt: string;
}

export interface SpecialFund {
  _id?: string;
  id?: number | string;
  name: string;
  description?: string;
  accountBalance: number;
  createdAt: string;
}

export interface Transaction {
  _id?: string;
  id?: number | string;
  entityId: number | string; 
  entityType: 'student' | 'class' | 'special';
  amount: number;
  type: TransactionType;
  date: string;
  reason: string;
  createdAt: string;
  entityName?: string;
}

export interface FinanceState {
  currentUser: User | null;
  admins: Admin[];
  students: Student[];
  classes: ClassEntity[];
  specialFunds: SpecialFund[];
  transactions: Transaction[];
  isLoading: boolean;
}

export interface FinanceContextType extends FinanceState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addAdmin: (name: string, username: string, password: string) => Promise<void>;
  updateAdminPassword: (id: number | string, newPassword: string) => Promise<void>;
  updateAdminUsername: (id: number | string, newUsername: string) => Promise<void>;
  deleteAdmin: (id: number | string) => Promise<void>;
  addStudent: (name: string, username: string, password: string) => Promise<void>;
  updateStudentPassword: (id: number | string, newPassword: string) => Promise<void>;
  updateStudentUsername: (id: number | string, newUsername: string) => Promise<void>;
  deleteStudent: (id: number | string) => Promise<void>;
  addClass: (name: string) => Promise<void>;
  deleteClass: (id: number | string) => Promise<void>;
  // Special Fund Management
  addSpecialFund: (name: string, description: string) => Promise<void>;
  deleteSpecialFund: (id: number | string) => Promise<void>;
  // Transactions
  addTransaction: (
    entityId: number | string,
    entityType: 'student' | 'class' | 'special',
    amount: number,
    type: TransactionType,
    date: string,
    reason: string
  ) => Promise<void>;
  formatCurrency: (amount: number) => string;
}