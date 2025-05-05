import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Retrieve the user's name and ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.firstName || user?.name?.split(' ')[0] || 'User';
  const userId = user?.user_id;

  // Get current date for greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Navigation handlers
  const handleViewAllTransactions = () => {
    navigate('/transactions');
  };

  const handleManageGoals = () => {
    navigate('/goals');
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Fetch dashboard data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        const response = await fetch(`http://localhost:5000/api/dashboard?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header skeleton-header"></div>
        <div className="metrics-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="metric-card skeleton-card"></div>
          ))}
        </div>
        <div className="dashboard-section skeleton-table"></div>
        <div className="dashboard-section skeleton-goals"></div>
      </div>
    );
  }

  // Handle missing data
  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <h2>Unable to load dashboard data</h2>
          <p>Please check your connection and try again</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    );
  }

  // Handle missing properties with default values
  const {
    totalBalance = 0,
    income = 0,
    expense = 0,
    totalSavings = 0,
    recentTransactions = [],
    savingGoals = [],
  } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="greeting-section">
            <h1 className="greeting">{getCurrentGreeting()},</h1>
            <h1 className="user-name">{userName}</h1>
          </div>
          <p className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card balance">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M21,18V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.89 10,8V16A2,2 0 0,0 12,18H21M12,16H22V8H12V16M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Total Balance</h3>
            <p className="metric-value">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
        
        <div className="metric-card income">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Income</h3>
            <p className="metric-value">{formatCurrency(income)}</p>
          </div>
        </div>
        
        <div className="metric-card expense">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,12L1.5,15.5L2.91,16.91L5,14.83L9.59,19.41L11,18L5,12Z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Expenses</h3>
            <p className="metric-value">{formatCurrency(expense)}</p>
          </div>
        </div>
        
        <div className="metric-card savings">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M5,3V21H19V3H5M7,5H17V7H7V5M7,9H17V11H7V9M17,19H7V13H17V19Z" />
            </svg>
          </div>
          <div className="metric-content">
            <h3>Total Savings</h3>
            <p className="metric-value">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <button className="view-all-btn" onClick={handleViewAllTransactions}>View All</button>
        </div>
        
        <div className="transactions-wrapper">
          {recentTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index} className={transaction.type.toLowerCase()}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="transaction-desc">
                      <span>{transaction.description || 'Unnamed Transaction'}</span>
                    </td>
                    <td>{transaction.category_name || 'Uncategorized'}</td>
                    <td>
                      <span className={`transaction-badge ${transaction.type.toLowerCase()}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`amount ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'Expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No transactions recorded yet</p>
              <button className="add-transaction-btn">Add Transaction</button>
            </div>
          )}
        </div>
      </div>

      {/* Saving Goals */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Savings Goals</h2>
          <button className="view-all-btn" onClick={handleManageGoals}>Manage Goals</button>
        </div>
        
        <div className="goals-grid">
          {savingGoals.length > 0 ? (
            savingGoals.map((goal, index) => {
              const progressPercent = ((goal.saved / goal.target) * 100).toFixed(0);
              return (
                <div key={index} className="goal-card">
                  <div className="goal-header">
                    <h3>{goal.name}</h3>
                    <span className="goal-percentage">{progressPercent}%</span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="goal-details">
                    <div className="saved">
                      <span className="label">Saved</span>
                      <span className="value">{formatCurrency(goal.saved)}</span>
                    </div>
                    <div className="target">
                      <span className="label">Target</span>
                      <span className="value">{formatCurrency(goal.target)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>No saving goals set</p>
              <button className="add-goal-btn">Create Goal</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;