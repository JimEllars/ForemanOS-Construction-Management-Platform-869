import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store';
import { expenseService } from '../../services/expenseService';

const ExpenseModal = ({ isOpen, onClose, expense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('materials');
  const [projectId, setProjectId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [receipt, setReceipt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { projects } = useStore(state => state.data);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount || '');
      setCategory(expense.category || 'materials');
      setProjectId(expense.project_id || '');
      setExpenseDate(expense.expense_date || new Date().toISOString().split('T')[0]);
    } else {
      // Reset form for new expense
      setDescription('');
      setAmount('');
      setCategory('materials');
      setProjectId('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const expenseData = {
      project_id: projectId,
      description,
      amount: parseFloat(amount),
      category,
      expense_date: expenseDate,
    };

    try {
      if (expense) {
        await expenseService.updateExpense(expense.id, expenseData, receipt);
      } else {
        await expenseService.createExpense(expenseData, receipt);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Expense' : 'Add New Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="projectId">Project</label>
          <select id="projectId" value={projectId} onChange={e => setProjectId(e.target.value)} required className="w-full form-select">
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label htmlFor="amount">Amount</label>
          <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="w-full form-select">
            <option value="materials">Materials</option>
            <option value="labor">Labor</option>
            <option value="subcontractor">Subcontractor</option>
            <option value="equipment_rental">Equipment Rental</option>
            <option value="permits_fees">Permits & Fees</option>
            <option value="fuel">Fuel</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="expenseDate">Date</label>
          <Input id="expenseDate" type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="receipt">Receipt (Optional)</label>
          <Input id="receipt" type="file" onChange={e => setReceipt(e.target.files ? e.target.files[0] : null)} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
