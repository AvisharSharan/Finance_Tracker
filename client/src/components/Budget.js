import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Budget.css';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newBudget, setNewBudget] = useState({
    category: '',
    monthlyLimit: '',
  });
  const [editBudget, setEditBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch budgets from API
  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
  
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      setError('User ID is missing. Please log in again.');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:5000/api/budgets?userId=${userId}`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setError('Failed to fetch budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  // Add a new budget
  const handleAddBudget = async (e) => {
    e.preventDefault();
  
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      setError('User ID is missing. Please log in again.');
      return;
    }
  
    try {
      await axios.post('http://localhost:5000/api/budgets', {
        userId,
        category_id: newBudget.category,
        monthly_limit: parseFloat(newBudget.monthlyLimit),
      });
      setNewBudget({ category: '', monthlyLimit: '' });
      setShowAddForm(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error adding budget:', error);
      setError('Failed to add budget. Please try again.');
    }
  };

  // Set budget for editing
  const handleEditBudget = (budget) => {
    setEditBudget(budget);
  };

  // Update an existing budget
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
  
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      setError('User ID is missing. Please log in again.');
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/api/budgets/${editBudget.budget_id}`, {
        userId,
        monthly_limit: parseFloat(editBudget.monthly_limit),
      });
      setEditBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      setError('Failed to update budget. Please try again.');
    }
  };

  // Delete a budget
  const handleDeleteBudget = async (budgetId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      setError('User ID is missing. Please log in again.');
      return;
    }
  
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`http://localhost:5000/api/budgets/${budgetId}`, {
          data: { userId },
        });
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
        setError('Failed to delete budget. Please try again.');
      }
    }
  };

  // Calculate total budget metrics
  const calculateTotals = () => {
    let totalLimit = 0;
    let totalSpent = 0;
    
    budgets.forEach(budget => {
      totalLimit += Number(budget.monthly_limit || 0);
      totalSpent += Number(budget.spent || 0);
    });
    
    const totalRemaining = totalLimit - totalSpent;
    const overallProgress = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    
    return {
      totalLimit,
      totalSpent,
      totalRemaining,
      overallProgress: Math.min(overallProgress, 100)
    };
  };

  const totals = calculateTotals();

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="budget-container">
        <div className="budget-header skeleton-header"></div>
        <div className="budget-metrics">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="metric-card skeleton-card"></div>
          ))}
        </div>
        <div className="budget-table-container skeleton-table"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="budget-container">
        <div className="error-state">
          <h2>Unable to load budget data</h2>
          <p>{error}</p>
          <button onClick={fetchBudgets}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-container">
      {/* Header Section */}
      <div className="budget-header">
        <h1>Budget Planner</h1>
        <p>Track and manage your monthly spending limits</p>
      </div>

      {/* Budget Summary Cards */}
      <div className="budget-metrics">
        <div className="metric-card total-budget">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21,18V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.89 10,8V16A2,2 0 0,0 12,18H21M12,16H22V8H12V16M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Total Budget</h3>
            <p className="metric-value">${totals.totalLimit.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="metric-card total-spent">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12,13A5,5 0 0,1 7,8H9A3,3 0 0,0 12,11A3,3 0 0,0 15,8H17A5,5 0 0,1 12,13M12,3A3,3 0 0,1 15,6H9A3,3 0 0,1 12,3M19,6H17A5,5 0 0,0 12,1A5,5 0 0,0 7,6H5C3.89,6 3,6.89 3,8V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V8C21,6.89 20.1,6 19,6Z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Total Spent</h3>
            <p className="metric-value">${totals.totalSpent.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="metric-card remaining">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24">
              <path d="M13,2.03C17.73,2.5 21.5,6.25 21.95,11C22.5,16.5 18.5,21.38 13,21.93V19.93C16.64,19.5 19.5,16.61 19.96,12.97C20.5,8.58 17.39,4.59 13,4.05V2.05L13,2.03M11,2.06V4.06C9.57,4.26 8.22,4.84 7.1,5.74L5.67,4.26C7.19,3 9.05,2.25 11,2.06M4.26,5.67L5.69,7.1C4.8,8.23 4.24,9.58 4.05,11H2.05C2.25,9.04 3,7.19 4.26,5.67M2.06,13H4.06C4.24,14.42 4.81,15.77 5.69,16.9L4.27,18.33C3.03,16.81 2.26,14.96 2.06,13M7.1,18.37C8.23,19.26 9.58,19.82 11,20V22C9.04,21.79 7.18,21 5.67,19.74L7.1,18.37M12,7.5L7.5,12H11V16H13V12H16.5L12,7.5Z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Remaining</h3>
            <p className={`metric-value ${totals.totalRemaining < 0 ? 'negative' : ''}`}>
              ${totals.totalRemaining.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar for Overall Budget */}
      <div className="overall-progress-container">
        <div className="progress-header">
          <h3>Overall Budget Usage</h3>
          <span className="progress-percentage">{Math.round(totals.overallProgress)}%</span>
        </div>
        <div className="overall-progress-bar">
          <div 
            className="overall-progress-fill"
            style={{ 
              width: `${totals.overallProgress}%`,
              backgroundColor: totals.overallProgress > 85 
                ? '#e74c3c' 
                : totals.overallProgress > 70 
                  ? '#f39c12' 
                  : '#6c5ce7'
            }}
          ></div>
        </div>
      </div>

      {/* Add Budget Button and Form */}
      <div className="add-budget-section">
        {!showAddForm ? (
          <button 
            className="add-budget-button"
            onClick={() => setShowAddForm(true)}
          >
            <svg viewBox="0 0 24 24" className="add-icon">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Budget
          </button>
        ) : (
          <div className="add-budget-card">
            <div className="card-header">
              <h3>Create New Budget</h3>
              <button 
                className="close-button" 
                onClick={() => setShowAddForm(false)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <form className="add-budget-form" onSubmit={handleAddBudget}>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
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
                <label htmlFor="monthlyLimit">Monthly Limit ($)</label>
                <input
                  type="number"
                  id="monthlyLimit"
                  value={newBudget.monthlyLimit}
                  onChange={(e) => setNewBudget({ ...newBudget, monthlyLimit: e.target.value })}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Budgets Table */}
      <div className="budget-table-container">
        {budgets.length > 0 ? (
          <table className="budget-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Monthly Limit</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const spent = Number(budget.spent || 0);
                const limit = Number(budget.monthly_limit || 0);
                const remaining = limit - spent;
                const progress = limit ? Math.min((spent / limit) * 100, 100) : 0;
                const progressColor = progress > 85 
                  ? '#e74c3c' 
                  : progress > 70 
                    ? '#f39c12' 
                    : '#6c5ce7';

                return (
                  <tr key={budget.budget_id} className={remaining < 0 ? 'over-budget' : ''}>
                    <td className="category-name">{budget.category_name}</td>
                    <td className="amount">${limit.toFixed(2)}</td>
                    <td className="amount">${spent.toFixed(2)}</td>
                    <td className={`amount ${remaining < 0 ? 'negative' : ''}`}>
                      ${remaining.toFixed(2)}
                    </td>
                    <td className="progress-cell">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%`, backgroundColor: progressColor }}
                        ></div>
                      </div>
                      <span className="progress-text">{Math.round(progress)}%</span>
                    </td>
                    <td className="actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditBudget(budget)}
                        title="Edit Budget"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteBudget(budget.budget_id)}
                        title="Delete Budget"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" className="empty-icon">
              <path d="M13.07 10.41A5 5 0 0 0 13.07 4.59A3.39 3.39 0 0 1 15 4A3.5 3.5 0 0 1 15 11A3.39 3.39 0 0 1 13.07 10.41M5.5 7.5A3.5 3.5 0 1 1 9 11A3.5 3.5 0 0 1 5.5 7.5M7.5 7.5A1.5 1.5 0 1 0 9 6A1.5 1.5 0 0 0 7.5 7.5M16 17V19H2V17S2 13 9 13 16 17 16 17M14 17C13.86 16.22 12.67 15 9 15S4.07 16.31 4 17M15.95 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13Z" />
            </svg>
            <p>No budgets set up yet</p>
            <button className="add-budget-button" onClick={() => setShowAddForm(true)}>Create Your First Budget</button>
          </div>
        )}
      </div>

      {/* Edit Budget Modal */}
      {editBudget && (
        <div className="modal-overlay">
          <div className="edit-budget-modal">
            <div className="modal-header">
              <h3>Edit Budget - {editBudget.category_name}</h3>
              <button className="close-button" onClick={() => setEditBudget(null)}>
                <svg viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <form className="edit-budget-form" onSubmit={handleUpdateBudget}>
              <div className="form-group">
                <label htmlFor="editLimit">Monthly Limit ($)</label>
                <input
                  type="number"
                  id="editLimit"
                  value={editBudget.monthly_limit || ''}
                  onChange={(e) => setEditBudget({ ...editBudget, monthly_limit: e.target.value })}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setEditBudget(null)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
