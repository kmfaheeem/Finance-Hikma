import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoading } = useFinance();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(username, password);
    
    if (success) {
      if (username.toLowerCase().startsWith('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/reports');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl rotate-3 flex items-center justify-center shadow-blue-200 shadow-lg mb-6 transition-transform duration-300 hover:rotate-6 hover:scale-105">
            <span className="text-white font-bold text-2xl -rotate-3 tracking-tighter">HF</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to your Hikma-Finance account
          </p>
        </div>

        {/* Card Section */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60 p-8 sm:p-10 rounded-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Username Input */}
            <div className="group">
              <label 
                htmlFor="username" 
                className={`block text-sm font-medium transition-colors duration-200 ${focusedInput === 'username' ? 'text-blue-600' : 'text-slate-700'}`}
              >
                Username
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon 
                    size={18} 
                    className={`transition-colors duration-200 ${focusedInput === 'username' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} 
                  />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-slate-50/50 focus:bg-white placeholder-slate-400"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium transition-colors duration-200 ${focusedInput === 'password' ? 'text-blue-600' : 'text-slate-700'}`}
              >
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock 
                    size={18} 
                    className={`transition-colors duration-200 ${focusedInput === 'password' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} 
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-slate-50/50 focus:bg-white placeholder-slate-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-100 animate-[shake_0.5s_ease-in-out]">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <Button 
                type="submit"
                isLoading={isLoading}
                className="group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign in
                {!isLoading && (
                  <ArrowRight 
                    size={18} 
                    className="ml-2 transition-transform duration-200 group-hover:translate-x-1" 
                  />
                )}
              </Button>
            </div>
          </form>
        </Card>
        
        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Secure Financial Management System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};