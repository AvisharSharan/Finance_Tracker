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
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Format date to YYYY-MM-DD for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const fetchTransactions = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/transactions?userId=${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
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
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.user_id;
  
      if (!userId) {
        console.error('User ID is missing');
        return;
      }
  
      if (editingTransactionId) {
        // Edit transaction
        await axios.put(`http://localhost:5000/api/transactions/${editingTransactionId}`, {
          userId,
          ...newTransaction,
        });
        setEditingTransactionId(null);
      } else {
        // Add new transaction
        await axios.post('http://localhost:5000/api/transactions', {
          userId,
          ...newTransaction,
        });
      }
  
      setNewTransaction({ date: '', amount: '', category: '', type: '', description: '' });
      setError('');
      fetchTransactions(); // Refresh the transaction list
    } catch (error) {
      console.error('Error saving transaction:', error);
      setError('Failed to save transaction. Please try again.');
    }
  };

  const handleEditTransaction = (transaction) => {
    setNewTransaction({
      date: formatDateForInput(transaction.date),
      amount: transaction.amount,
      category: transaction.category_id,
      type: transaction.type.toLowerCase(),
      description: transaction.description || '',
    });
    setEditingTransactionId(transaction.transaction_id);
    
    // Scroll to the form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${transactionId}`);
        fetchTransactions(); // Refresh the transaction list
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setError('Failed to delete transaction. Please try again.');
      }
    }
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return (
      transaction.description?.toLowerCase().includes(lowerCaseSearch) ||
      transaction.category_name?.toLowerCase().includes(lowerCaseSearch) ||
      transaction.type?.toLowerCase().includes(lowerCaseSearch) ||
      transaction.amount.toString().includes(searchTerm)
    );
  });

  // Get color for category dot based on category name
  const getCategoryColor = (categoryName) => {
    if (!categoryName) return '#6c5ce7';
    
    // Generate a consistent color based on the category name
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#6c5ce7', // primary
      '#00b894', // success
      '#fdcb6e', // warning
      '#e74c3c', // danger
      '#fd79a8', // accent
      '#0984e3', // blue
      '#00cec9', // teal
      '#e84393', // pink
      '#6c5ce7', // purple
      '#00b894', // green
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Loading state
  if (loading) {
    return (
      <div className="transactions-container">
        <div className="skeleton-header"></div>
        <div className="transactions-content">
          <div className="skeleton-form"></div>
          <div className="skeleton-table"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <h1>Transactions</h1>
        <p>Manage your income and expenses</p>
      </div>

      <div className="transactions-content">
        {/* Form Card */}
        <div className="form-card">
          <div className="form-header">
            <h2>{editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}</h2>
            {editingTransactionId && (
              <button 
                className="close-button" 
                onClick={() => {
                  setEditingTransactionId(null);
                  setNewTransaction({ date: '', amount: '', category: '', type: '', description: '' });
                  setError('');
                }}
                title="Cancel editing"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            )}
          </div>
          <div className="form-body">
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
                  step="0.01"
                  min="0"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <div className="radio-group">
                  <label 
                    className={`radio-option income ${newTransaction.type === 'income' ? 'selected' : ''}`}
                    htmlFor="income"
                  >
                    <input
                      type="radio"
                      id="income"
                      name="type"
                      value="income"
                      checked={newTransaction.type === 'income'}
                      onChange={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                      required
                    />
                    <svg viewBox="0 0 24 24" style={{width: '20px', height: '20px', marginRight: '8px'}}>
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M7,10L12,15L17,10H7Z" fill="currentColor" />
                    </svg>
                    Income
                  </label>
                  <label 
                    className={`radio-option expense ${newTransaction.type === 'expense' ? 'selected' : ''}`}
                    htmlFor="expense"
                  >
                    <input
                      type="radio"
                      id="expense"
                      name="type"
                      value="expense"
                      checked={newTransaction.type === 'expense'}
                      onChange={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                      required
                    />
                    <svg viewBox="0 0 24 24" style={{width: '20px', height: '20px', marginRight: '8px'}}>
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M17,10H7V12H17V10Z" fill="currentColor" />
                    </svg>
                    Expense
                  </label>
                </div>
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
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Add a description..."
                  rows="3"
                ></textarea>
              </div>
              
              {error && (
                <div className="error-message">
                  <svg viewBox="0 0 24 24">
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  {error}
                </div>
              )}
              
              <button type="submit" className="submit-button">
                {editingTransactionId ? (
                  <>
                    <svg viewBox="0 0 24 24">
                      <path d="M17,3A2,2 0 0,1 19,5V21L12,18L5,21V5C5,3.89 5.9,3 7,3H17M7,5V18.72L12,16.34L17,18.72V5H7Z" />
                    </svg>
                    Update Transaction
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                    </svg>
                    Add Transaction
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="table-card">
          <div className="table-header">
            <h2>Transaction History</h2>
            <div className="search-bar">
              <svg viewBox="0 0 24 24">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="table-body">
            {filteredTransactions.length > 0 ? (
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
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td className="date-cell">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className={`amount-cell ${transaction.type.toLowerCase()}`}>
                        {transaction.type.toLowerCase() === 'expense' ? '- ' : '+ '}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td>
                        <span className="category-label">
                          <span 
                            className="category-dot" 
                            style={{backgroundColor: getCategoryColor(transaction.category_name)}}
                          ></span>
                          {transaction.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                          {transaction.type.toLowerCase() === 'income' ? (
                            <svg viewBox="0 0 24 24">
                              <path d="M16,10H8V8H16V10M16,14H8V12H16V14M16,18H8V16H16V18M20,4V20C20,21.11 19.11,22 18,22H6C4.89,22 4,21.11 4,20V4C4,2.89 4.89,2 6,2H18C19.11,2 20,2.89 20,4M18,4H6V20H18V4Z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24">
                              <path d="M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9M1,10H3V20H19V22H1V10Z" />
                            </svg>
                          )}
                          {transaction.type}
                        </span>
                      </td>
                      <td className="description-cell">
                        {transaction.description || '-'}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEditTransaction(transaction)}
                          title="Edit transaction"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                          </svg>
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteTransaction(transaction.transaction_id)}
                          title="Delete transaction"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-transactions">
                <svg viewBox="0 0 24 24">
                  <path d="M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9M1,10H3V20H19V22H1V10Z" />
                </svg>
                {searchTerm ? (
                  <p>No transactions matching "{searchTerm}"</p>
                ) : (
                  <p>No transactions recorded yet</p>
                )}
                {searchTerm && (
                  <button 
                    className="submit-button" 
                    style={{maxWidth: '200px'}} 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;