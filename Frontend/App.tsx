import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ToastProvider } from './context/ToastContext'; // <-- Import this
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Actions } from './pages/admin/Actions';
import { StudentFunds } from './pages/admin/StudentFunds';
import { ClassFunds } from './pages/admin/ClassFunds';
import { SpecialFunds } from './pages/admin/SpecialFunds';
import { Reports } from './pages/student/Reports';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// ... (Keep your ProtectedRoute component exactly as is) ...
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser } = useFinance();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/student/reports'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  // ... (Keep your AppRoutes exactly as is) ...
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/actions" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Actions /></Layout></ProtectedRoute>} />
      <Route path="/admin/students-fund" element={<ProtectedRoute allowedRoles={['admin']}><Layout><StudentFunds /></Layout></ProtectedRoute>} />
      <Route path="/admin/class-fund" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ClassFunds /></Layout></ProtectedRoute>} />
      <Route path="/admin/special-fund" element={<ProtectedRoute allowedRoles={['admin']}><Layout><SpecialFunds /></Layout></ProtectedRoute>} />
      <Route path="/student/reports" element={<ProtectedRoute allowedRoles={['admin', 'student']}><Layout><Reports /></Layout></ProtectedRoute>} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <FinanceProvider>
      <ToastProvider> {/* <-- Wrap with ToastProvider inside FinanceProvider */}
        <HashRouter>
          <AppRoutes />

          {/* Vercel Tools */}
          <SpeedInsights />
          <Analytics /> {/* Add this here */}

        </HashRouter>
      </ToastProvider>
    </FinanceProvider>
  );
};

export default App;