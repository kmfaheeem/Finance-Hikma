import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinanceContextType, Student, ClassEntity, SpecialFund, Transaction, User, TransactionType, Admin } from '../types';
import { INITIAL_ADMINS, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_TRANSACTIONS } from '../services/mockData';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// API URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const USER_STORAGE_KEY = 'hikma_finance_user';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize currentUser from localStorage to persist login across refreshes
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [admins, setAdmins] = useState<Admin[]>(INITIAL_ADMINS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [classes, setClasses] = useState<ClassEntity[]>(INITIAL_CLASSES);
  const [specialFunds, setSpecialFunds] = useState<SpecialFund[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  
  const refreshData = async () => {
    try {
      const res = await fetch(`${API_URL}/data`);
      if (!res.ok) throw new Error('Backend not reachable');
      const data = await res.json();
      
      const normalize = (item: any) => ({ ...item, id: item._id || item.id });

      setAdmins(data.admins.map(normalize));
      setStudents(data.students.map(normalize));
      setClasses(data.classes.map(normalize));
      setSpecialFunds(data.specialFunds ? data.specialFunds.map(normalize) : []);
      setTransactions(data.transactions.map(normalize));
      
    } catch (error) {
      // console.warn("Backend not connected, using local data");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
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
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user)); // Save to storage
          await refreshData();
          setIsLoading(false);
          return true;
        }
      }
    } catch (e) {
      console.warn("Login: Backend unreachable, trying local...");
    }

    const admin = admins.find(a => a.username === username && a.password === pass);
    if (admin) {
      const userObj: User = { ...admin, id: String(admin.id), role: 'admin' };
      setCurrentUser(userObj);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj)); // Save to storage
      setIsLoading(false);
      return true;
    }

    const student = students.find(s => s.username === username && s.password === pass);
    if (student) {
      const userObj: User = { ...student, id: String(student.id), role: 'student' };
      setCurrentUser(userObj);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj)); // Save to storage
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY); // Clear from storage
    setCurrentUser(null);
  };

  const executeAction = async (
    apiCall: () => Promise<void>, 
    localFallback: () => void
  ) => {
    setIsLoading(true);
    try {
      await apiCall();
      await refreshData(); 
    } catch (e) {
      console.warn("Action failed on backend or backend unreachable, executing locally.", e);
      localFallback(); 
    }
    setIsLoading(false);
  };

  // --- Admin Management ---
  const addAdmin = async (name: string, username: string, password: string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/admins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, password, role: 'admin' })
        });
        if(!res.ok) throw new Error("Failed to add admin");
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
        const res = await fetch(`${API_URL}/admins/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });
        if(!res.ok) throw new Error("Failed to update admin password");
      },
      () => {
        setAdmins(admins.map(a => (String(a.id) === String(id) || a._id === id) ? { ...a, password: newPassword } : a));
      }
    );
  };

  const updateAdminUsername = async (id: number | string, newUsername: string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/admins/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newUsername })
        });
        if(!res.ok) throw new Error("Failed to update admin username");
      },
      () => {
        setAdmins(admins.map(a => (String(a.id) === String(id) || a._id === id) ? { ...a, username: newUsername } : a));
      }
    );
  };

  const deleteAdmin = async (id: number | string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/admins/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error("Failed to delete admin");
      },
      () => {
        setAdmins(admins.filter(a => String(a.id) !== String(id) && a._id !== id));
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
        if (!res.ok) throw new Error('Failed to create student');
      },
      () => {
        const newStudent: Student = {
          id: Date.now(),
          name, 
          username, 
          password, 
          accountBalance: 0, 
          createdAt: new Date().toISOString()
        };
        setStudents(prev => [...prev, newStudent]);
      }
    );
  };

  const updateStudentPassword = async (id: number | string, newPassword: string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });
        if(!res.ok) throw new Error("Failed to update student password");
      },
      () => {
        setStudents(students.map(s => (String(s.id) === String(id) || s._id === id) ? { ...s, password: newPassword } : s));
      }
    );
  };

  const updateStudentUsername = async (id: number | string, newUsername: string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newUsername })
        });
        if(!res.ok) throw new Error("Failed to update student username");
      },
      () => {
        setStudents(students.map(s => (String(s.id) === String(id) || s._id === id) ? { ...s, username: newUsername } : s));
      }
    );
  };

  const deleteStudent = async (id: number | string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error("Failed to delete student");
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
        const res = await fetch(`${API_URL}/classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        if(!res.ok) throw new Error("Failed to add class");
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
        const res = await fetch(`${API_URL}/classes/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error("Failed to delete class");
      },
      () => {
        setClasses(classes.filter(c => String(c.id) !== String(id) && c._id !== id));
      }
    );
  };

  // --- Special Fund Management ---
  const addSpecialFund = async (name: string, description: string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/special-funds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        if(!res.ok) throw new Error("Failed to add special fund");
      },
      () => {
        const newFund: SpecialFund = {
          id: Date.now(),
          name, description, accountBalance: 0, createdAt: new Date().toISOString()
        };
        setSpecialFunds([...specialFunds, newFund]);
      }
    );
  };

  const deleteSpecialFund = async (id: number | string) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/special-funds/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error("Failed to delete special fund");
      },
      () => {
        setSpecialFunds(specialFunds.filter(f => String(f.id) !== String(id) && f._id !== id));
      }
    );
  };


  // --- Transactions ---
  const addTransaction = async (
    entityId: number | string,
    entityType: 'student' | 'class' | 'special',
    amount: number,
    type: TransactionType,
    date: string,
    reason: string
  ) => {
    await executeAction(
      async () => {
        const res = await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityId, entityType, amount, type, date, reason })
        });
        if(!res.ok) throw new Error("Failed to add transaction");
      },
      () => {
        const newTx: Transaction = {
          id: Date.now(),
          entityId, entityType, amount, type, date, reason, createdAt: new Date().toISOString()
        };
        setTransactions([newTx, ...transactions]);

        const updateEntityBalance = (entities: any[]) => {
          return entities.map(e => {
            if (String(e.id) === String(entityId) || e._id === entityId) {
              const newBal = type === 'deposit' ? e.accountBalance + amount : e.accountBalance - amount;
              return { ...e, accountBalance: newBal };
            }
            return e;
          });
        };

        if (entityType === 'student') {
          setStudents(updateEntityBalance(students));
        } else if (entityType === 'class') {
          setClasses(updateEntityBalance(classes));
        } else if (entityType === 'special') {
          setSpecialFunds(updateEntityBalance(specialFunds));
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
        specialFunds,
        transactions,
        isLoading,
        login,
        logout,
        addAdmin,
        updateAdminPassword,
        updateAdminUsername,
        deleteAdmin,
        addStudent,
        updateStudentPassword,
        updateStudentUsername,
        deleteStudent,
        addClass,
        deleteClass,
        addSpecialFund,
        deleteSpecialFund,
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