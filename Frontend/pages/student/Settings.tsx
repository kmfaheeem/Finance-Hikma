import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // Ensure lucide-react is installed

export const Settings: React.FC = () => {
  const { user } = useFinance();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({
    type: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // Sync state with user data once loaded
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // Client-side Validation
    if (username.length < 3) {
      setStatus({ type: 'error', message: 'Username must be at least 3 characters.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/settings/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          newUsername: username,
          newPassword: password, // Sent as plain text as requested
          role: user?.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Profile updated successfully! Reloading...' });
        // Optional: Refresh page after 1.5s to sync sidebar/context names
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to update profile.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Server error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center">Loading user profile...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <span className="px-3 py-1 text-xs font-semibold uppercase bg-blue-100 text-blue-700 rounded-full">
          {user.role}
        </span>
      </div>

      <Card className="p-6 shadow-md border-t-4 border-t-blue-600">
        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              required
            />
          </div>

          {/* Password Field with Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Only fill this if you want to change your password.</p>
          </div>

          <hr className="border-gray-100" />

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded-lg text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status.message}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 py-2.5"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
};