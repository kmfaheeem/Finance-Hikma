import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Landmark, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  FileText,
  User,
  Star
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useFinance();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!currentUser) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Actions', path: '/admin/actions', icon: Settings },
    { name: 'Student Funds', path: '/admin/students-fund', icon: Users },
    { name: 'Class Funds', path: '/admin/class-fund', icon: Landmark },
    { name: 'Special Funds', path: '/admin/special-fund', icon: Star },
  ];

  const studentLinks = [
    { name: 'My Reports', path: '/student/reports', icon: FileText },
  ];

  const links = currentUser.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20 no-print">
        <h1 className="font-bold text-lg text-blue-600">Hikma-Finance</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-10 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:min-h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-blue-400">Hikma-Finance</h2>
          <div className="flex items-center gap-2 mt-4 p-2 rounded bg-slate-800">
            <div className="bg-slate-700 p-1 rounded-full">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-slate-400">@{currentUser.username}</p>
            </div>
          </div>
        </div>

        <nav className="mt-2 px-3 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {link.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-300 hover:text-white text-sm font-medium w-full px-3 py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Go Back Button */}
        {location.pathname !== '/admin/dashboard' && location.pathname !== '/student/reports' && (
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors no-print"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back
          </button>
        )}
        
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden no-print"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};