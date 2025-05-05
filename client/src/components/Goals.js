import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });
  const [addSavingsGoalId, setAddSavingsGoalId] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Retrieve the logged-in user's ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.user_id;

  // Fetch goals from the backend
  const fetchGoals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/goals?userId=${userId}`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Handle form submission to add a new goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      setError('All fields are required.');
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/goals', {
        userId,
        name: newGoal.name,
        target: parseFloat(newGoal.target),
        deadline: newGoal.deadline,
      });
      
      setNewGoal({ name: '', target: '', deadline: '' });
      setError('');
      setShowAddForm(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to add goal. Please try again.');
    }
  };

  // Handle adding savings to a goal
  const handleAddSavings = async (e) => {
    e.preventDefault();
    
    if (!savingsAmount || parseFloat(savingsAmount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    try {
      await axios.put(`http://localhost:5000/api/goals/${addSavingsGoalId}/savings`, {
        amount: parseFloat(savingsAmount),
      });
      
      setSavingsAmount('');
      setAddSavingsGoalId(null);
      setError('');
      fetchGoals();
    } catch (error) {
      console.error('Error adding savings:', error);
      setError('Failed to update savings. Please try again.');
    }
  };

  // Handle deleting a goal
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/goals/${goalId}`);
      setGoals(goals.filter((goal) => goal.goal_id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal. Please try again.');
    }
  };

  // Calculate total progress
  const calculateTotalProgress = () => {
    if (goals.length === 0) return 0;
    
    let totalSaved = 0;
    let totalTarget = 0;
    
    goals.forEach(goal => {
      totalSaved += Number(goal.saved) || 0;
      totalTarget += Number(goal.target) || 0;
    });
    
    return totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format date from ISO to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get days remaining until deadline
  const getDaysRemaining = (deadlineString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(deadlineString);
    deadline.setHours(0, 0, 0, 0);
    
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due today';
    if (daysDiff === 1) return '1 day left';
    return `${daysDiff} days left`;
  };

  // Calculate attainment status
  const getGoalStatus = (saved, target, deadline) => {
    const progress = (saved / target) * 100;
    const daysLeft = getDaysRemaining(deadline);
    
    if (progress >= 100) return 'Completed';
    if (daysLeft === 'Overdue') return 'Overdue';
    if (progress < 30 && daysLeft !== 'Overdue') return 'Just started';
    
    return 'In progress';
  };

  // Loading state
  if (loading) {
    return (
      <div className="goals-container">
        <div className="goals-header skeleton-header"></div>
        <div className="goals-summary skeleton-summary"></div>
        <div className="goals-grid">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="goal-card skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="goals-container">
      {/* Header Section */}
      <div className="goals-header">
        <h1>Savings Goals</h1>
        <p>Track your progress towards financial milestones</p>
      </div>

      {/* Summary Section */}
      <div className="goals-summary">
        <div className="summary-stats">
          <div className="stat">
            <h3>Total Goals</h3>
            <p>{goals.length}</p>
          </div>
          <div className="stat">
            <h3>Total Saved</h3>
            <p>{formatCurrency(goals.reduce((sum, goal) => sum + Number(goal.saved || 0), 0))}</p>
          </div>
          <div className="stat">
            <h3>Total Target</h3>
            <p>{formatCurrency(goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0))}</p>
          </div>
        </div>
        
        <div className="overall-progress-container">
          <div className="progress-header">
            <h3>Overall Progress</h3>
            <span className="progress-percentage">{Math.round(calculateTotalProgress())}%</span>
          </div>
          <div className="overall-progress-bar">
            <div 
              className="overall-progress-fill"
              style={{ width: `${calculateTotalProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Add Goal Section */}
      <div className="add-goal-section">
        {!showAddForm ? (
          <button 
            className="add-goal-button"
            onClick={() => setShowAddForm(true)}
          >
            <svg viewBox="0 0 24 24" className="add-icon">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Goal
          </button>
        ) : (
          <div className="add-goal-card">
            <div className="card-header">
              <h3>Create New Goal</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <form className="add-goal-form" onSubmit={handleAddGoal}>
              <div className="form-group">
                <label htmlFor="name">Goal Name</label>
                <input
                  type="text"
                  id="name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., New Car"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="target">Target Amount ($)</label>
                <input
                  type="number"
                  id="target"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  placeholder="e.g., 10000"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline">Target Date</label>
                <input
                  type="date"
                  id="deadline"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
            const status = getGoalStatus(goal.saved, goal.target, goal.deadline);
            const daysRemaining = getDaysRemaining(goal.deadline);
            
            // Determine status color based on status
            let statusColor = 'var(--primary-color)'; // default
            if (status === 'Completed') statusColor = 'var(--success-color)';
            else if (status === 'Overdue') statusColor = 'var(--danger-color)';
            else if (status === 'Just started') statusColor = 'var(--warning-color)';
            
            // Determine progress color based on progress percentage
            let progressColor = 'var(--primary-color)';
            if (progress >= 100) progressColor = 'var(--success-color)';
            else if (progress < 30) progressColor = 'var(--warning-color)';
            
            return (
              <div key={goal.goal_id} className="goal-card">
                <div className="goal-header">
                  <h3>{goal.name}</h3>
                  <span 
                    className="goal-status" 
                    style={{ backgroundColor: statusColor }}
                  >
                    {status}
                  </span>
                </div>
                
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{progress.toFixed(0)}%</span>
                </div>
                
                <div className="goal-details">
                  <div className="amount-details">
                    <div className="saved">
                      <span>Saved</span>
                      <strong>{formatCurrency(goal.saved)}</strong>
                    </div>
                    <div className="separator">of</div>
                    <div className="target">
                      <span>Target</span>
                      <strong>{formatCurrency(goal.target)}</strong>
                    </div>
                  </div>
                  
                  <div className="time-details">
                    <div className="deadline">
                      <svg viewBox="0 0 24 24">
                        <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                      </svg>
                      <div>
                        <span>Deadline</span>
                        <strong>{formatDate(goal.deadline)}</strong>
                      </div>
                    </div>
                    <div className={`remaining ${daysRemaining === 'Overdue' ? 'overdue' : ''}`}>
                      <span>{daysRemaining}</span>
                    </div>
                  </div>
                </div>
                
                <div className="goal-actions">
                  {progress < 100 && (
                    <button 
                      className="add-savings-button"
                      onClick={() => setAddSavingsGoalId(goal.goal_id)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z" />
                      </svg>
                      Add Savings
                    </button>
                  )}
                  <button 
                    className="delete-goal-button"
                    onClick={() => handleDeleteGoal(goal.goal_id)}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                    Delete
                  </button>
                </div>
                
                {addSavingsGoalId === goal.goal_id && (
                  <div className="add-savings-form-container">
                    <div className="form-header">
                      <h4>Add Savings</h4>
                      <button 
                        className="close-form-button"
                        onClick={() => {
                          setAddSavingsGoalId(null);
                          setSavingsAmount('');
                          setError('');
                        }}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleAddSavings}>
                      <div className="input-group">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          value={savingsAmount}
                          onChange={(e) => setSavingsAmount(e.target.value)}
                          placeholder="Amount"
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>
                      {error && <p className="error-message">{error}</p>}
                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={() => {
                            setAddSavingsGoalId(null);
                            setSavingsAmount('');
                            setError('');
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="submit-button">
                          Add Savings
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" className="empty-icon">
              <path d="M21,18V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.89 10,8V16A2,2 0 0,0 12,18H21M12,16H22V8H12V16M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
            <p>You don't have any savings goals yet</p>
            <button 
              className="add-goal-button"
              onClick={() => setShowAddForm(true)}
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;