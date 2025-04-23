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

  const handleAddBudget = async (e) => {
    e.preventDefault();
  
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      alert('User ID is missing. Please log in again.');
      return;
    }
  
    try {
      await axios.post('http://localhost:5000/api/budgets', {
        userId, // Pass the logged-in user's ID
        category_id: newBudget.category,
        monthly_limit: parseFloat(newBudget.monthlyLimit),
      });
      setNewBudget({ category: '', monthlyLimit: '' });
      fetchBudgets(); // Refresh the budget list
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to add budget. Please try again.');
    }
  };

  const handleEditBudget = (budget) => {
    setEditBudget(budget);
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
  
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      alert('User ID is missing. Please log in again.');
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/api/budgets/${editBudget.budget_id}`, {
        userId, // Pass the logged-in user's ID
        monthly_limit: parseFloat(editBudget.monthly_limit),
      });
      setEditBudget(null);
      fetchBudgets(); // Refresh the budget list
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error('User ID is missing');
      alert('User ID is missing. Please log in again.');
      return;
    }
  
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`http://localhost:5000/api/budgets/${budgetId}`, {
          data: { userId }, // Pass the logged-in user's ID
        });
        fetchBudgets(); // Refresh the budget list
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="budget-container">
      <h2>Budget</h2>

      {/* Add Budget Form */}
      <form className="add-budget-form" onSubmit={handleAddBudget}>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={newBudget.category}
            onChange={(e) =>
              setNewBudget({ ...newBudget, category: e.target.value })
            }
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
        <div>
          <label htmlFor="monthlyLimit">Monthly Limit:</label>
          <input
            type="number"
            id="monthlyLimit"
            value={newBudget.monthlyLimit}
            onChange={(e) =>
              setNewBudget({ ...newBudget, monthlyLimit: e.target.value })
            }
            required
          />
        </div>
        <button type="submit">Add Budget</button>
      </form>

      {/* Edit Budget Form */}
      {editBudget && (
        <form className="edit-budget-form" onSubmit={handleUpdateBudget}>
          <div>
            <label htmlFor="editMonthlyLimit">Edit Limit:</label>
            <input
              type="number"
              id="editMonthlyLimit"
              value={editBudget.monthly_limit || ''}
              onChange={(e) =>
                setEditBudget({ ...editBudget, monthly_limit: e.target.value })
              }
              required
            />
          </div>
          <button type="submit">Update</button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => setEditBudget(null)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Budget Table */}
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
          {budgets.map((budget, index) => {
            const remaining =
              (budget.monthly_limit || 0) - (budget.spent || 0);
            const progress = budget.monthly_limit
              ? Math.min(((budget.spent || 0) / budget.monthly_limit) * 100, 100)
              : 0;

            return (
              <tr key={index} className={remaining < 0 ? 'over-budget' : ''}>
                <td>{budget.category_name}</td>
                <td>${Number(budget.monthly_limit || 0).toFixed(2)}</td>
                <td>${Number(budget.spent || 0).toFixed(2)}</td>
                <td>${Number(remaining || 0).toFixed(2)}</td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  {progress.toFixed(0)}%
                </td>
                <td className="actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditBudget(budget)}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteBudget(budget.budget_id)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Budget;