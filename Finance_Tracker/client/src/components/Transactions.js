import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    amount: '',
    category: '',
    type: '',
    description: '',
  });
  const [editingTransactionId, setEditingTransactionId] = useState(null); // Track the transaction being edited
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions?userId=1');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleAddOrEditTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.date || !newTransaction.amount || !newTransaction.category || !newTransaction.type) {
      setError('All fields are required.');
      return;
    }

    try {
      if (editingTransactionId) {
        // Edit transaction
        await axios.put(`http://localhost:5000/api/transactions/${editingTransactionId}`, {
          userId: 1,
          ...newTransaction,
        });
        setEditingTransactionId(null);
      } else {
        // Add new transaction
        await axios.post('http://localhost:5000/api/transactions', {
          userId: 1,
          ...newTransaction,
        });
      }

      setNewTransaction({ date: '', amount: '', category: '', type: '', description: '' });
      setError('');
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEditTransaction = (transaction) => {
    setNewTransaction({
      date: transaction.date.split('T')[0], // Format date for input
      amount: transaction.amount,
      category: transaction.category_id,
      type: transaction.type,
      description: transaction.description,
    });
    setEditingTransactionId(transaction.transaction_id);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${transactionId}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  return (
    <div className="transactions-page">
      <div className="left-panel">
        <h2 className="form-title">{editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}</h2>
        <form className="transaction-form" onSubmit={handleAddOrEditTransaction}>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
              required
            >
              <option value="">Select a type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              rows="3"
            ></textarea>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="submit-button">
            {editingTransactionId ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>

      <div className="right-panel">
        <h2 className="table-title">Transaction History</h2>
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>${transaction.amount}</td>
                  <td>{transaction.category_name}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.description}</td>
                  <td className="actions-cell">
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteTransaction(transaction.transaction_id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;