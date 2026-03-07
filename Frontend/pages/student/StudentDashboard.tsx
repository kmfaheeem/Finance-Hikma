import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../../components/ui/Card';
import { TrendingUp, TrendingDown, Wallet, Printer } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
    const { transactions, students, currentUser, formatCurrency } = useFinance();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const studentRecord = useMemo(() => {
        return students.find(s => s.username === currentUser?.username);
    }, [students, currentUser]);

    const studentTransactions = useMemo(() => {
        if (!studentRecord) return [];

        let data = transactions.filter(t =>
            t.entityType === 'student' &&
            (String(t.entityId) === String(studentRecord.id) || t.entityId === studentRecord._id)
        );

        // Date Range Filtering
        if (startDate) {
            data = data.filter(t => t.date >= startDate);
        }
        if (endDate) {
            data = data.filter(t => t.date <= endDate);
        }

        return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, studentRecord, startDate, endDate]);

    const stats = useMemo(() => {
        if (!studentRecord) return { totalCredit: 0, totalDebit: 0, balance: 0 };

        const allStudentTx = transactions.filter(t =>
            t.entityType === 'student' &&
            (String(t.entityId) === String(studentRecord.id) || t.entityId === studentRecord._id)
        );

        const totalCredit = allStudentTx
            .filter(t => t.type === 'deposit')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalDebit = allStudentTx
            .filter(t => t.type === 'withdrawal')
            .reduce((acc, t) => acc + t.amount, 0);

        return {
            totalCredit,
            totalDebit,
            balance: studentRecord.accountBalance || 0
        };
    }, [transactions, studentRecord]);

    const filteredTotal = useMemo(() => {
        return studentTransactions.reduce((acc, t) => {
            return t.type === 'deposit' ? acc + t.amount : acc - t.amount;
        }, 0);
    }, [studentTransactions]);

    const handlePrint = () => {
        window.print();
    };

    if (!studentRecord) {
        return <div className="p-8 text-center text-slate-500">Student record not found.</div>;
    }

    return (
        <div className="space-y-6 flex-1 h-full min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
                    <p className="text-slate-500">Welcome, {studentRecord.name}. Here is your financial overview.</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Printer size={16} />
                        Print Statement
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print:mb-8">
                <Card className="bg-white border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-l-emerald-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Credit</p>
                            <h3 className="text-xl font-bold mt-1 text-emerald-600">+{formatCurrency(stats.totalCredit)}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-full">
                            <TrendingUp className="text-emerald-600" size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Debit</p>
                            <h3 className="text-xl font-bold mt-1 text-red-600">-{formatCurrency(stats.totalDebit)}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-full">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Balance</p>
                            <h3 className={`text-xl font-bold mt-1 ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(stats.balance)}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-full ${stats.balance >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                            <Wallet className={stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'} size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Transactions Report */}
            <Card className="print:shadow-none print:border-none print:p-0 shadow-md">
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-semibold text-slate-800 text-lg">Transaction History</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-600">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-600">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left bg-white">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <th className="px-6 py-4 print:bg-white">Date</th>
                                <th className="px-6 py-4 print:bg-white">Description</th>
                                <th className="px-6 py-4 print:bg-white">Type</th>
                                <th className="px-6 py-4 print:bg-white text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {studentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                                        No transactions found within the selected period.
                                    </td>
                                </tr>
                            ) : (
                                studentTransactions.map(t => (
                                    <tr key={t.id || (t as any)._id} className="hover:bg-slate-50 transition-colors print:hover:bg-white">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                            {new Date(t.date).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 max-w-sm truncate print:whitespace-normal print:overflow-visible">
                                            {t.reason}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm ${t.type === 'deposit' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'
                                                } print:bg-transparent print:text-black print:border print:border-slate-300 print:px-1`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold text-base ${t.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'
                                            } print:text-black`}>
                                            {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {studentTransactions.length > 0 && (
                            <tfoot>
                                <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200 print:bg-white">
                                    <td colSpan={3} className="px-6 py-4 text-right text-slate-700">Net Total (Filtered):</td>
                                    <td className={`px-6 py-4 text-right text-lg ${filteredTotal >= 0 ? 'text-emerald-600' : 'text-red-600'} print:text-black`}>
                                        {formatCurrency(filteredTotal)}
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
