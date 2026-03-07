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
  Star,
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

const NotificationDropdown = () => {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications, students } = useFinance();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const negativeStudents = students.filter(s => s.accountBalance < 0);
  const unreadNotifs = notifications.filter(n => !n.read);

  const totalUnread = unreadNotifs.length + (negativeStudents.length > 0 ? 1 : 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-200"
      >
        <Bell size={20} />
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 flex flex-col">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex gap-3">
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={clearNotifications}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {negativeStudents.length > 0 && currentUser?.role === 'admin' && (
              <div
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/negative-balances');
                }}
                className="p-3 bg-red-50 border border-red-100 rounded-md flex items-start gap-3 cursor-pointer hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-red-800">Negative Balances Detected</p>
                  <p className="text-xs text-red-600 mt-1">
                    {negativeStudents.length} student(s) currently have a negative account balance. Click to view.
                  </p>
                </div>
              </div>
            )}

            {notifications.length === 0 && negativeStudents.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3 rounded-md flex items-start gap-3 cursor-pointer transition-colors ${notif.read ? 'bg-white opacity-60' : 'bg-slate-50 border-l-2 border-blue-500 hover:bg-slate-100'}`}
                >
                  {notif.type === 'success' ? (
                    <div className="text-green-500 shrink-0 mt-0.5"><CheckCircle size={18} /></div>
                  ) : notif.type === 'error' ? (
                    <div className="text-red-500 shrink-0 mt-0.5"><XCircle size={18} /></div>
                  ) : (
                    <div className="text-blue-500 shrink-0 mt-0.5"><Info size={18} /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.read ? 'text-slate-600' : 'text-slate-800 font-medium'} break-words`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex justify-between">
                      {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    { name: 'Student Funds', path: '/admin/students-fund', icon: Users },
    { name: 'Class Funds', path: '/admin/class-fund', icon: Landmark },
    { name: 'Special Funds', path: '/admin/special-fund', icon: Star },
    // Fix: Using AlertTriangle which is imported above
    { name: 'Negative Balances', path: '/admin/negative-balances', icon: AlertTriangle },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  ];

  const links = currentUser.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row shadow-2xl">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20 no-print">
        <h1 className="font-bold text-lg text-blue-600">Hikma-Finance</h1>
        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && <NotificationDropdown />}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          flex flex-col fixed inset-y-0 left-0 z-10 w-64 bg-white/40 backdrop-blur-3xl border-r border-slate-200/50 text-slate-900 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:min-h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div>
          <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight text-blue-600">Hikma-Finance</h2>
            <div
              role="button"
              onClick={() => {
                navigate('/profile');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full text-left gap-2 mt-4 p-2 rounded-2xl cursor-pointer bg-white/60 shadow-sm border border-slate-200/50 hover:bg-white/90 transition-all duration-300"
            >
              <div className="bg-slate-600 h-8 w-8 rounded-full text-white flex items-center justify-center overflow-hidden shrink-0">
                {currentUser.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">@{currentUser.username}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-2 px-3 space-y-2 flex-1 overflow-y-auto">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive
                  ? 'bg-blue-600 shadow-md text-white shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
              >
                <Icon size={20} />
                {link.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/50 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-600 hover:text-red-600 text-sm font-semibold w-full px-3 py-2 rounded-xl hover:bg-red-50/80 transition-all duration-300"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 no-print">
          {location.pathname !== '/admin/dashboard' && location.pathname !== '/student/dashboard' ? (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back
            </button>
          ) : (
            <div></div> /* Empty div to keep flex alignment */
          )}

          <div className="hidden md:block">
            {currentUser.role === 'admin' && <NotificationDropdown />}
          </div>
        </div>

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