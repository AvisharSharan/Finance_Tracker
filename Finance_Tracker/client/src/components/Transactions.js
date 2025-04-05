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

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.date || !newTransaction.amount || !newTransaction.category || !newTransaction.type) {
      setError('All fields are required.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/transactions', {
        userId: 1,
        date: newTransaction.date,
        amount: newTransaction.amount,
        category: newTransaction.category,
        type: newTransaction.type,
        description: newTransaction.description,
      });
      setNewTransaction({ date: '', amount: '', category: '', type: '', description: '' });
      setError('');
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="transactions-page">
      <div className="left-panel">
        <h2 className="form-title">Add Transaction</h2>
        <form className="transaction-form" onSubmit={handleAddTransaction}>
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
          <button type="submit" className="submit-button">Add Transaction</button>
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