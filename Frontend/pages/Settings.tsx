import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, User, Lock, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser, updateProfile } = useFinance();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const updates: any = { username };
      if (password.trim() !== '') {
        updates.password = password;
      }

      await updateProfile(updates);
      setStatus({ type: 'success', text: 'Account settings updated successfully!' });
      setPassword(''); // Clear password field after update
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Account Settings
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Update your core credentials to ensure your account remains secure.
          </p>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-md shadow-xl border-slate-200/60 p-6 sm:p-10 rounded-2xl relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-50 opacity-50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-50 opacity-50 blur-3xl pointer-events-none"></div>

        {status.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 relative z-10 transition-all duration-300 ${status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {status.type === 'success' ? <ShieldCheck size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
            <p className="font-medium text-sm">{status.text}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 w-full border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg py-3 transition-colors duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  className="pl-10 w-full border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg py-3 transition-colors duration-200"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            >
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};