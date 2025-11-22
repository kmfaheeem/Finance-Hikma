import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TransactionType } from '../../types';
import { History, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const ClassFunds: React.FC = () => {
  const { classes, addTransaction, transactions, isLoading, formatCurrency } = useFinance();

  const [classId, setClassId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('deposit');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !amount) return;
    
    await addTransaction(
      classId,
      'class',
      Number(amount),
      type,
      date,
      reason
    );

    setAmount('');
    setReason('');
  };

  const recentClassTransactions = transactions
    .filter(t => t.entityType === 'class')
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Funds</h1>
          <p className="text-slate-500">Manage budgets and expenses for specific classes.</p>
        </div>

        <Card>
          <h2 className="text-lg font-semibold mb-6">New Class Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select
                  required
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Bal: {formatCurrency(c.accountBalance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      checked={type === 'deposit'} 
                      onChange={() => setType('deposit')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">Deposit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      checked={type === 'withdrawal'} 
                      onChange={() => setType('withdrawal')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-slate-700">Withdrawal</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Description</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Science Fair Material Costs"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button type="submit" isLoading={isLoading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                Record Class Transaction
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="h-full">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <History size={20} />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {recentClassTransactions.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No transactions yet.</p>
            )}
            {recentClassTransactions.map(t => {
              const cls = classes.find(c => String(c.id) === String(t.entityId) || c._id === t.entityId);
              return (
                <div key={t.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                  <div className={`mt-1 ${t.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {t.type === 'deposit' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{cls?.name || 'Unknown Class'}</p>
                    <p className="text-xs text-slate-500">{t.reason}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold ${t.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};