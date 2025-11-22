import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinanceContextType, Student, ClassEntity, Transaction, User, TransactionType, Admin } from '../types';
import { INITIAL_ADMINS, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_TRANSACTIONS } from '../services/mockData';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// API URL - Change this if hosting elsewhere
// Checks if there is a hidden environment variable, otherwise defaults to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // Initialize with Mock Data so app works even if backend is down
  const [admins, setAdmins] = useState<Admin[]>(INITIAL_ADMINS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [classes, setClasses] = useState<ClassEntity[]>(INITIAL_CLASSES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to check if backend is available (optional usage)
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Fetch initial data on load
const refreshData = async () => {
  try {
    const res = await fetch(`${API_URL}/data`);
    if (!res.ok) throw new Error('Backend not reachable');
    const data = await res.json();
    
    // Helper to ensure everything has an 'id' property
    const normalize = (item: any) => ({ ...item, id: item._id || item.id });

    setAdmins(data.admins.map(normalize));
    setStudents(data.students.map(normalize));
    setClasses(data.classes.map(normalize));
    setTransactions(data.transactions.map(normalize));
    
    setIsBackendConnected(true);
  } catch (error) {
    // ...
  }
};

  // Try to connect on mount
  useEffect(() => {
    refreshData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    
    // 1. Try Backend
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
          await refreshData();
          setIsLoading(false);
          return true;
        }
      }
    } catch (e) {
      console.warn("Login: Backend unreachable, trying local...");
    }

    // 2. Fallback: Local Check
    const admin = admins.find(a => a.username === username && a.password === pass);
    if (admin) {
      setCurrentUser({ ...admin, id: String(admin.id), role: 'admin' });
      setIsLoading(false);
      return true;
    }

    const student = students.find(s => s.username === username && s.password === pass);
    if (student) {
      setCurrentUser({ ...student, id: String(student.id), role: 'student' });
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- Helper for dual execution (API + Local Fallback) ---
  const executeAction = async (
    apiCall: () => Promise<void>, 
    localFallback: () => void
  ) => {
    setIsLoading(true);
    try {
      await apiCall();
      await refreshData(); // Sync with server
    } catch (e) {
      console.warn("Action failed on backend, executing locally.");
      localFallback(); // Update local state directly
    }
    setIsLoading(false);
  };

  // --- Admin Management ---
  const addAdmin = async (name: string, username: string, password: string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/admins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, password, role: 'admin' })
        });
      },
      () => {
        const newAdmin: Admin = {
          id: Date.now(),
          name, username, password, role: 'admin'
        };
        setAdmins([...admins, newAdmin]);
      }
    );
  };

  const updateAdminPassword = async (id: number | string, newPassword: string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/admins/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });
      },
      () => {
        setAdmins(admins.map(a => (String(a.id) === String(id) || a._id === id) ? { ...a, password: newPassword } : a));
      }
    );
  };

  const updateAdminUsername = async (id: number | string, newUsername: string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/admins/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newUsername })
        });
      },
      () => {
        setAdmins(admins.map(a => (String(a.id) === String(id) || a._id === id) ? { ...a, username: newUsername } : a));
      }
    );
  };

// --- Student Management ---
  const addStudent = async (name: string, username: string, password: string = 'default123') => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, password })
        });

        // FIX: Check if the response was successful
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create student');
        }
      },
      () => {
        // Local Fallback (runs if backend is unreachable OR if we threw the error above)
        const newStudent: Student = {
          id: Date.now(),
          name, 
          username, 
          password, 
          accountBalance: 0, 
          createdAt: new Date().toISOString()
        };
        setStudents(prev => [...prev, newStudent]);
        
        // Optional: Alert the user if it was a specific error (like duplicate username)
        // You can remove this alert if you prefer the UI to just update optimistically
        // alert("Note: Action executed locally. Check console for backend errors.");
      }
    );
  };

  const updateStudentPassword = async (id: number | string, newPassword: string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });
      },
      () => {
        setStudents(students.map(s => (String(s.id) === String(id) || s._id === id) ? { ...s, password: newPassword } : s));
      }
    );
  };

  const updateStudentUsername = async (id: number | string, newUsername: string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newUsername })
        });
      },
      () => {
        setStudents(students.map(s => (String(s.id) === String(id) || s._id === id) ? { ...s, username: newUsername } : s));
      }
    );
  };

  const deleteStudent = async (id: number | string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
      },
      () => {
        setStudents(students.filter(s => String(s.id) !== String(id) && s._id !== id));
      }
    );
  };

  // --- Class Management ---
  const addClass = async (name: string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
      },
      () => {
        const newClass: ClassEntity = {
          id: Date.now(),
          name, accountBalance: 0, createdAt: new Date().toISOString()
        };
        setClasses([...classes, newClass]);
      }
    );
  };

  const deleteClass = async (id: number | string) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/classes/${id}`, { method: 'DELETE' });
      },
      () => {
        setClasses(classes.filter(c => String(c.id) !== String(id) && c._id !== id));
      }
    );
  };

  // --- Transactions ---
  const addTransaction = async (
    entityId: number | string,
    entityType: 'student' | 'class',
    amount: number,
    type: TransactionType,
    date: string,
    reason: string
  ) => {
    await executeAction(
      async () => {
        await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityId, entityType, amount, type, date, reason })
        });
      },
      () => {
        const newTx: Transaction = {
          id: Date.now(),
          entityId, entityType, amount, type, date, reason, createdAt: new Date().toISOString()
        };
        setTransactions([newTx, ...transactions]);

        // Update Balance Locally
        if (entityType === 'student') {
          setStudents(students.map(s => {
            if (String(s.id) === String(entityId) || s._id === entityId) {
              const newBal = type === 'deposit' ? s.accountBalance + amount : s.accountBalance - amount;
              return { ...s, accountBalance: newBal };
            }
            return s;
          }));
        } else {
          setClasses(classes.map(c => {
            if (String(c.id) === String(entityId) || c._id === entityId) {
              const newBal = type === 'deposit' ? c.accountBalance + amount : c.accountBalance - amount;
              return { ...c, accountBalance: newBal };
            }
            return c;
          }));
        }
      }
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        admins,
        students,
        classes,
        transactions,
        isLoading,
        login,
        logout,
        addAdmin,
        updateAdminPassword,
        updateAdminUsername,
        addStudent,
        updateStudentPassword,
        updateStudentUsername,
        deleteStudent,
        addClass,
        deleteClass,
        addTransaction,
        formatCurrency
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
