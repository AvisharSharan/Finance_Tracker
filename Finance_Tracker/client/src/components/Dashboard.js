import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  // Retrieve the user's name from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || 'User'; // Fallback to 'User' if name is not available

  // Fetch dashboard data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard');
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle loading state
  if (!dashboardData) {
    return <div>Loading...</div>;
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
      {/* Welcome Header */}
      <div className="welcome-header">
        <h1>Welcome back, <span className="user-name">{userName}</span>!</h1>
        <p>It's the best time to manage your finances.</p>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric total-balance">
          <h3>Total Balance</h3>
          <p>${totalBalance}</p>
        </div>
        <div className="metric income">
          <h3>Income</h3>
          <p>${income}</p>
        </div>
        <div className="metric expense">
          <h3>Expense</h3>
          <p>${expense}</p>
        </div>
        <div className="metric savings">
          <h3>Total Savings</h3>
          <p>${totalSavings}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment Name</th>
              <th>Method</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.date}</td>
                <td>${transaction.amount}</td>
                <td>{transaction.paymentName}</td>
                <td>{transaction.method}</td>
                <td>{transaction.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Saving Goals */}
      <div className="saving-goals">
        <h3>Saving Goals</h3>
        {savingGoals.map((goal, index) => (
          <div key={index} className="goal">
            <h4>{goal.name}</h4>
            <p>
              ${goal.saved} / ${goal.target} (
              {((goal.saved / goal.target) * 100).toFixed(0)}%)
            </p>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(goal.saved / goal.target) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;