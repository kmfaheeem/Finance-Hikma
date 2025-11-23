import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TransactionType } from '../../types';
import { History, ArrowUpCircle, ArrowDownCircle, Trash2, PlusCircle } from 'lucide-react';

export const SpecialFunds: React.FC = () => {
  const { specialFunds, addSpecialFund, deleteSpecialFund, addTransaction, transactions, isLoading, formatCurrency } = useFinance();

  // State for creating new fund
  const [newFundName, setNewFundName] = useState('');
  const [newFundDesc, setNewFundDesc] = useState('');

  // State for transaction
  const [fundId, setFundId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('deposit');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFundName) return;
    
    await addSpecialFund(newFundName, newFundDesc);
    setNewFundName('');
    setNewFundDesc('');
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundId || !amount) return;
    
    await addTransaction(
      fundId,
      'special',
      Number(amount),
      type,
      date,
      reason
    );

    setAmount('');
    setReason('');
  };

  const recentTransactions = transactions
    .filter(t => t.entityType === 'special')
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Special Funds</h1>
        <p className="text-slate-500">Manage specific funds like Events, Sports, or Charity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Fund Section */}
        <Card>
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <PlusCircle size={20} />
            <h2 className="text-lg font-semibold">Create New Fund</h2>
          </div>
          <form onSubmit={handleAddFund} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fund Name</label>
              <input
                type="text"
                required
                value={newFundName}
                onChange={(e) => setNewFundName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Annual Sports Day"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={newFundDesc}
                onChange={(e) => setNewFundDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the fund"
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Fund
            </Button>
          </form>
        </Card>

        {/* Active Funds List */}
        <Card className="flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Active Special Funds</h2>
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2">
            {specialFunds.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No special funds created yet.</p>
            )}
            {specialFunds.map(fund => (
              <div key={fund.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{fund.name}</p>
                  {fund.description && <p className="text-xs text-slate-500">{fund.description}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${fund.accountBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(fund.accountBalance)}
                  </span>
                  <button 
                    onClick={() => deleteSpecialFund(fund.id!)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Fund"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold mb-6">Record Transaction</h2>
            <form onSubmit={handleTransaction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Fund</label>
                  <select
                    required
                    value={fundId}
                    onChange={(e) => setFundId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Fund...</option>
                    {specialFunds.map(f => (
                      <option key={f.id} value={f.id}>{f.name} (Bal: {formatCurrency(f.accountBalance)})</option>
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
                      <span className="text-slate-700">Deposit (Add)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={type === 'withdrawal'} 
                        onChange={() => setType('withdrawal')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-slate-700">Withdrawal (Spend)</span>
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
                  placeholder="e.g. Purchase of equipment"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
                  Process Transaction
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Recent History */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <History size={20} />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No transactions yet.</p>
              )}
              {recentTransactions.map(t => {
                const fund = specialFunds.find(f => String(f.id) === String(t.entityId) || f._id === String(t.entityId));
                return (
                  <div key={t.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                    <div className={`mt-1 ${t.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{fund?.name || 'Unknown Fund'}</p>
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
    </div>
  );
};