import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });
  const [addSavingsGoalId, setAddSavingsGoalId] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [error, setError] = useState('');

  // Retrieve the logged-in user's ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.user_id;

  // Fetch goals from the backend
  const fetchGoals = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/goals?userId=${userId}`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchGoals();
    }
  }, [userId, fetchGoals]);

  // Handle form submission to add a new goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      setError('All fields are required.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/goals', {
        userId, // Pass the logged-in user's ID
        name: newGoal.name,
        target: parseFloat(newGoal.target),
        deadline: newGoal.deadline,
      });
      setNewGoal({ name: '', target: '', deadline: '' });
      setError('');
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  // Handle adding savings to a goal
  const handleAddSavings = async (e) => {
    e.preventDefault();
    if (!savingsAmount || savingsAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/goals/${addSavingsGoalId}/savings`, {
        userId, // Pass the logged-in user's ID
        amount: parseFloat(savingsAmount),
      });
      setSavingsAmount('');
      setAddSavingsGoalId(null);
      setError('');
      fetchGoals();
    } catch (error) {
      console.error('Error adding savings:', error);
    }
  };

  // Handle deleting a goal
  const handleDeleteGoal = async (goalId) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/${goalId}`, {
        data: { userId }, // Pass the logged-in user's ID
      });
      setGoals(goals.filter((goal) => goal.goal_id !== goalId)); // Update state to remove the deleted goal
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="goals-container">
      <h2 className="page-title">Goals</h2>

      <div className="form-container">
        <h3 className="form-title">Add a New Goal</h3>
        <form className="add-goal-form" onSubmit={handleAddGoal}>
          <div className="form-group">
            <label htmlFor="name">Goal Name</label>
            <input
              type="text"
              id="name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="target">Target Amount</label>
            <input
              type="number"
              id="target"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              type="date"
              id="deadline"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="submit-button">Add Goal</button>
        </form>
      </div>

      <h3 className="progress-section-title">Your Goals</h3>

      <div className="goals-list">
        {goals.map((goal, index) => {
          const progress = Math.min((goal.saved / goal.target) * 100, 100);
          return (
            <div key={index} className="goal-card">
              <h3>{goal.name}</h3>
              <p>
                Saved: <strong>${goal.saved}</strong> / <strong>${goal.target}</strong>
              </p>
              <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="action-buttons">
                  <button
                    className="add-savings-button"
                    onClick={() => setAddSavingsGoalId(goal.goal_id)}
                  >
                    +
                  </button>
                  <button
                    className="delete-icon-button"
                    onClick={() => handleDeleteGoal(goal.goal_id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p className="progress-text">{progress.toFixed(0)}% Complete</p>

              {addSavingsGoalId === goal.goal_id && (
                <form className="add-savings-form" onSubmit={handleAddSavings}>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                    required
                  />
                  <button type="submit" className="submit-savings-button">Save</button>
                  <button
                    type="button"
                    className="cancel-savings-button"
                    onClick={() => setAddSavingsGoalId(null)}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;