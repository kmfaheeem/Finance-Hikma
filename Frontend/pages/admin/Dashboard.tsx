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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Card className="bg-white border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Student Funds</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalStudentFunds)}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-full">
              <Users className="text-emerald-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Class Funds</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalClassFunds)}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Landmark className="text-blue-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Special Funds</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalSpecialFunds)}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Star className="text-purple-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Inflow</p>
              <h3 className="text-xl font-bold mt-1 text-green-600">+{formatCurrency(stats.totalDeposits)}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <TrendingUp className="text-green-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Outflow</p>
              <h3 className="text-xl font-bold mt-1 text-red-600">-{formatCurrency(stats.totalWithdrawals)}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-full">
              <TrendingDown className="text-red-600" size={20} />
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
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(value: number) => [`₹${value}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="in" fill="#10b981" radius={[4, 4, 0, 0]} name="Inflow" />
                  <Bar dataKey="out" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outflow" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Students List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Top Students</h3>
              <Link to="/student/reports" className="text-blue-600 text-sm hover:underline flex items-center">
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
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.name}</p>
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