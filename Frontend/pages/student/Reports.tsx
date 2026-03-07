import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../../components/ui/Card';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { Printer, Calendar, Filter, X } from 'lucide-react';

export const Reports: React.FC = () => {
  const { transactions, students, classes, specialFunds, currentUser, formatCurrency } = useFinance();
  const [reportType, setReportType] = useState<'student' | 'class' | 'special'>('student');
  const [filterId, setFilterId] = useState<string>('all');
  // Changed single date filter to start and end dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Quick date handlers
  const setThisMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // Filter logic
  const filteredTransactions = useMemo(() => {
    let data = transactions.filter(t => t.entityType === reportType);

    // If logged in as student, restrict view to self
    if (currentUser?.role === 'student') {
      if (reportType === 'student') {
        // Find the student record that matches the logged-in username
        const studentRecord = students.find(s => s.username === currentUser.username);
        if (studentRecord) {
          data = data.filter(t => String(t.entityId) === String(studentRecord.id) || t.entityId === studentRecord._id);
        } else {
          data = [];
        }
      } else {
        // Students can see all class and special funds (public transparency)
      }
    } else {
      // Admin filters
      if (filterId !== 'all') {
        data = data.filter(t => String(t.entityId) === filterId || t.entityId === filterId);
      }
    }

    // Date Range Filtering
    if (startDate) {
      data = data.filter(t => t.date >= startDate);
    }
    if (endDate) {
      data = data.filter(t => t.date <= endDate);
    }

    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, reportType, filterId, startDate, endDate, currentUser, students]);

  const getEntityName = (id: number | string) => {
    const idStr = String(id);
    if (reportType === 'student') {
      return students.find(s => String(s.id) === idStr || s._id === idStr)?.name || 'Unknown';
    }
    if (reportType === 'class') {
      return classes.find(c => String(c.id) === idStr || c._id === idStr)?.name || 'Unknown';
    }
    if (reportType === 'special') {
      return specialFunds.find(f => String(f.id) === idStr || f._id === idStr)?.name || 'Unknown';
    }
    return 'Unknown';
  };

  const totalAmount = filteredTransactions.reduce((acc, t) => {
    return t.type === 'deposit' ? acc + t.amount : acc - t.amount;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  // Options construction for Selects
  const reportTypeOptions = [
    { value: 'student', label: 'Students Fund Report' },
    { value: 'class', label: 'Class Fund Report' },
    { value: 'special', label: 'Special Fund Report' },
  ];

  const entityOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All' }];
    if (reportType === 'student') {
      return [...options, ...students.map(s => ({ value: s.id, label: s.name }))];
    }
    if (reportType === 'class') {
      return [...options, ...classes.map(c => ({ value: c.id, label: c.name }))];
    }
    if (reportType === 'special') {
      return [...options, ...specialFunds.map(f => ({ value: f.id, label: f.name }))];
    }
    return options;
  }, [reportType, students, classes, specialFunds]);

  return (
    <div id="printable-area" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500">Detailed transaction history and statements.</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
          >
            <Printer size={16} />
            Print / Save as PDF
          </button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none print:p-0">
        {/* Filters Toolbar - Hidden on print */}
        <div className="mb-6 no-print border border-slate-200 rounded-lg bg-white shadow-sm">
          {/* Tabs for Report Type */}
          <div className="flex border-b border-slate-200 bg-slate-50 rounded-t-lg overflow-hidden">
            {reportTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setReportType(option.value as 'student' | 'class' | 'special');
                  setFilterId('all');
                }}
                className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${reportType === option.value
                  ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Entity Filter */}
              <div className="flex-1">
                {currentUser?.role === 'admin' ? (
                  <SearchableSelect
                    label={`Filter by ${reportTypeOptions.find(o => o.value === reportType)?.label.split(' ')[0]}`}
                    options={entityOptions}
                    value={filterId}
                    onChange={setFilterId}
                  />
                ) : (
                  <div className="block text-sm font-medium text-slate-700 mb-1">
                    Your Report
                  </div>
                )}
              </div>

              {/* Date Filters */}
              <div className="flex-1 flex flex-col sm:flex-row items-end gap-3">
                <div className="w-full sm:w-auto flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Calendar size={14} /> From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-full sm:w-auto flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Calendar size={14} /> To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100">
              <button onClick={setThisMonth} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 font-medium transition-colors">
                This Month
              </button>
              {(startDate || endDate || filterId !== 'all') && (
                <button onClick={() => { clearDates(); setFilterId('all'); }} className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 font-medium transition-colors flex items-center gap-1">
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 bg-slate-50 print:bg-white">Date</th>
                <th className="px-4 py-3 bg-slate-50 print:bg-white">Entity Name</th>
                <th className="px-4 py-3 bg-slate-50 print:bg-white">Description</th>
                <th className="px-4 py-3 bg-slate-50 print:bg-white">Type</th>
                <th className="px-4 py-3 bg-slate-50 print:bg-white text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors print:hover:bg-white">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {new Date(t.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {getEntityName(t.entityId)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate print:whitespace-normal print:overflow-visible">
                      {t.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${t.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        } print:bg-transparent print:text-black print:border print:border-slate-300 print:px-1`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${t.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'
                      } print:text-black`}>
                      {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 print:bg-white">
                  <td colSpan={4} className="px-4 py-3 text-right">Net Total:</td>
                  <td className={`px-4 py-3 text-right ${totalAmount >= 0 ? 'text-emerald-600' : 'text-red-600'} print:text-black`}>
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 text-center text-xs text-slate-400">
          <p>Generated by Hikma-Finance on {new Date().toLocaleDateString()}</p>
        </div>
      </Card>
    </div>
  );
};