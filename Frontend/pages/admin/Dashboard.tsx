import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Users, Landmark, TrendingUp, TrendingDown, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { students, classes, specialFunds, transactions, formatCurrency } = useFinance();

  const stats = useMemo(() => {
    const totalStudentFunds = students.reduce((acc, s) => acc + (s.accountBalance || 0), 0);
    const totalClassFunds = classes.reduce((acc, c) => acc + (c.accountBalance || 0), 0);
    const totalSpecialFunds = specialFunds.reduce((acc, s) => acc + (s.accountBalance || 0), 0);
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((acc, t) => acc + t.amount, 0);

    return { totalStudentFunds, totalClassFunds, totalSpecialFunds, totalDeposits, totalWithdrawals };
  }, [students, classes, specialFunds, transactions]);

  // Sort students by balance descending
  const topStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => (b.accountBalance || 0) - (a.accountBalance || 0))
      .slice(0, 6);
  }, [students]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
        in: dayTransactions.filter(t => t.type === 'deposit').reduce((acc, t) => acc + t.amount, 0),
        out: dayTransactions.filter(t => t.type === 'withdrawal').reduce((acc, t) => acc + t.amount, 0),
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
        <p className="text-slate-500">Track funds across all students, classes, and special funds.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-xl border-t-4 border-t-emerald-500 shadow-xl border-slate-200/50 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Fund Bank</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalStudentFunds + stats.totalClassFunds + stats.totalSpecialFunds)}</h3>
            </div>
            <div className="p-3 bg-emerald-100/80 rounded-2xl shadow-inner">
              <Landmark className="text-emerald-700" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-t-4 border-t-blue-500 shadow-xl border-slate-200/50 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Student & Class</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalStudentFunds + stats.totalClassFunds)}</h3>
            </div>
            <div className="p-3 bg-blue-100/80 rounded-2xl shadow-inner">
              <Users className="text-blue-700" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-t-4 border-t-green-500 shadow-xl border-slate-200/50 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Gross Deposits</p>
              <h3 className="text-2xl font-black mt-1 text-green-600">+{formatCurrency(stats.totalDeposits)}</h3>
            </div>
            <div className="p-3 bg-green-100/80 rounded-2xl shadow-inner">
              <TrendingUp className="text-green-700" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-t-4 border-t-red-500 shadow-xl border-slate-200/50 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Gross Outflow</p>
              <h3 className="text-2xl font-black mt-1 text-red-600">-{formatCurrency(stats.totalWithdrawals)}</h3>
            </div>
            <div className="p-3 bg-red-100/80 rounded-2xl shadow-inner">
              <TrendingDown className="text-red-700" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts & List Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[400px]">
            <h3 className="text-lg font-semibold mb-6 text-slate-800">Cash Flow (Last 7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', padding: '12px' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="in" fill="url(#colorIn)" radius={[6, 6, 0, 0]} name="Inflow" barSize={12} />
                  <Bar dataKey="out" fill="url(#colorOut)" radius={[6, 6, 0, 0]} name="Outflow" barSize={12} />

                  {/* SVG Gradients for Bars to look glassy UI */}
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Students List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800">Top Students</h3>
              <Link to="/admin/students-fund" className="text-blue-600 text-sm hover:underline flex items-center">
                View All <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              <ul className="space-y-4">
                {topStudents.map((student, index) => (
                  <li
                    key={student.id || (student as any)._id || index}
                    className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-700 text-sm font-black shadow-inner border border-blue-200/50">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">@{student.username}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${student.accountBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(student.accountBalance)}
                    </span>
                  </li>
                ))}
                {topStudents.length === 0 && (
                  <li className="text-slate-400 text-sm text-center py-4">No student data available.</li>
                )}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};