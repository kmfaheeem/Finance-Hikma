import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../../components/ui/Card';
import { AlertCircle } from 'lucide-react';

export const NegativeBalances: React.FC = () => {
  const { students, loading } = useFinance();

  // Filter for individuals with a balance below zero
  const defaulters = students.filter((student) => student.balance < 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 font-arabic">Negative Balances</h1>
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          {defaulters.length} Individuals Found
        </span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-emerald-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {defaulters.length > 0 ? (
                defaulters.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                      ₹{Math.abs(student.balance).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <AlertCircle className="h-10 w-10 mb-2" />
                      <p>No individuals currently have a negative balance.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};