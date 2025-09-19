import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { expenseService } from '../../services/expenseService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ExpenseModal from './ExpenseModal';

const { FiTrendingDown, FiPlus } = FiIcons;

const ExpensesScreen: React.FC = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpensesByCompany();
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenModal = (expense = null) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
    fetchExpenses(); // Refresh list after modal closes
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading expenses..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Expenses</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Log and track all your project expenses.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          New Expense
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Project</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-secondary-50 cursor-pointer" onClick={() => handleOpenModal(expense)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{expense.projects_fos2025.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">${parseFloat(expense.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className="text-primary-600 hover:text-primary-900">Edit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expenses.length === 0 && (
            <div className="text-center py-12">
              <SafeIcon icon={FiTrendingDown} className="w-12 h-12 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-medium">No expenses logged</h3>
              <p className="text-sm text-secondary-500 mb-4">Get started by logging your first expense.</p>
              <Button onClick={() => handleOpenModal()}>
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                Log Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={selectedExpense}
      />
    </div>
  );
};

export default ExpensesScreen;
