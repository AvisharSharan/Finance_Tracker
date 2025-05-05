import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend, ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import '../styles/Insights.css';

const Insights = () => {
  const [incomeExpenseData, setIncomeExpenseData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [savingsTrendData, setSavingsTrendData] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch insights data from the backend
  useEffect(() => {
    const fetchInsights = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.user_id;
  
      if (!userId) {
        console.error('User ID is missing');
        setError('Unable to retrieve user ID. Please log in again.');
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        
        const incomeExpenseResponse = await axios.get(`http://localhost:5000/api/insights/income-expense?userId=${userId}`);
        const categoryResponse = await axios.get(`http://localhost:5000/api/insights/category-spending?userId=${userId}`);
        const savingsTrendResponse = await axios.get(`http://localhost:5000/api/insights/savings-trend?userId=${userId}`);
        const topCategoriesResponse = await axios.get(`http://localhost:5000/api/insights/top-categories?userId=${userId}`);
        
        // Process data to ensure numeric values
        const incomeExpenseProcessed = incomeExpenseResponse.data.map(item => ({
          ...item,
          income: parseFloat(item.income) || 0,
          expense: parseFloat(item.expense) || 0
        }));
        
        const categoryProcessed = categoryResponse.data.map(item => ({
          ...item,
          amount: parseFloat(item.amount) || 0
        }));
        
        const savingsTrendProcessed = savingsTrendResponse.data.map(item => ({
          ...item,
          savings: parseFloat(item.savings) || 0
        }));
        
        const topCategoriesProcessed = topCategoriesResponse.data.map(item => ({
          ...item,
          amount: parseFloat(item.amount) || 0
        }));
  
        setIncomeExpenseData(incomeExpenseProcessed);
        setCategoryData(categoryProcessed);
        setSavingsTrendData(savingsTrendProcessed);
        setTopCategories(topCategoriesProcessed);
      } catch (error) {
        console.error('Error fetching insights data:', error);
        setError('Failed to load insights data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchInsights();
  }, []);

  // Calculate totals
  const totalIncome = incomeExpenseData.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = incomeExpenseData.reduce((acc, curr) => acc + curr.expense, 0);
  const netSavings = totalIncome - totalExpense;

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Colors for the pie chart
  const COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e74c3c', '#fd79a8', '#0984e3'];

  // Map colors to categories for indicators
  const getCategoryColor = (index) => COLORS[index % COLORS.length];

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="insights-container">
        <div className="skeleton-header"></div>
        <div className="key-insights">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="skeleton-card"></div>
          ))}
        </div>
        <div className="charts-grid">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="chart-card">
              <div className="skeleton-chart"></div>
            </div>
          ))}
        </div>
        <div className="trends-grid">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="chart-card">
              <div className="skeleton-chart"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="insights-container">
        <div className="insights-header">
          <h1>Insights</h1>
          <p>Data-driven analysis of your financial activities</p>
        </div>
        <div className="no-data-message">
          <svg className="no-data-icon" viewBox="0 0 24 24">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* Header Section */}
      <div className="insights-header">
        <h1>Financial Insights</h1>
        <p>Data-driven analysis of your financial activities</p>
      </div>
  
      {/* Key Insights Section */}
      <div className="key-insights">
        <div className="insight-card income">
          <h3>Total Income</h3>
          <p>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="insight-card expense">
          <h3>Total Expense</h3>
          <p>{formatCurrency(totalExpense)}</p>
        </div>
        <div className="insight-card savings">
          <h3>Net Savings</h3>
          <p>{formatCurrency(netSavings)}</p>
        </div>
      </div>
  
      {/* Charts Section */}
      <div className="charts-grid">
        {/* Income vs Expense Chart */}
        <div className="chart-card chart-animation">
          <h3>Income vs Expense</h3>
          {incomeExpenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" tick={{ fill: '#636e72' }} />
                <YAxis tick={{ fill: '#636e72' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#00b894" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <svg className="no-data-icon" viewBox="0 0 24 24">
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z" />
              </svg>
              <p>No income/expense data available</p>
            </div>
          )}
        </div>
  
        {/* Category-Wise Spending Chart */}
        <div className="chart-card chart-animation">
          <h3>Category-Wise Spending</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <svg className="no-data-icon" viewBox="0 0 24 24">
                <path d="M17.45,15.18L22,7.31V19L22,21H2V3H4V15.54L9.5,6L16,9.78L20.24,2.45L21.97,3.45L16.74,12.5L10.23,8.75L4.31,19H6.57L10.96,11.44L17.45,15.18Z" />
              </svg>
              <p>No category spending data available</p>
            </div>
          )}
        </div>
      </div>
  
      {/* Trends Section */}
      <div className="trends-grid">
        {/* Savings Trend */}
        <div className="chart-card chart-animation">
          <h3>Savings Trend</h3>
          {savingsTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" tick={{ fill: '#636e72' }} />
                <YAxis tick={{ fill: '#636e72' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  name="Savings"
                  stroke="#6c5ce7" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#6c5ce7', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#6c5ce7', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <svg className="no-data-icon" viewBox="0 0 24 24">
                <path d="M21,18V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.89 10,8V16A2,2 0 0,0 12,18H21M12,16H22V8H12V16M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
              </svg>
              <p>No savings trend data available</p>
            </div>
          )}
        </div>
  
        {/* Top Spending Categories */}
        <div className="chart-card chart-animation">
          <h3>Top Spending Categories</h3>
          {topCategories.length > 0 ? (
            <ul className="top-categories-list">
              {topCategories.map((category, index) => (
                <li key={index}>
                  <span className="category-name">
                    <span 
                      className="category-indicator" 
                      style={{ backgroundColor: getCategoryColor(index) }}
                    ></span>
                    {category.category}
                  </span>
                  <span className="category-amount">
                    {formatCurrency(category.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-data-message">
              <svg className="no-data-icon" viewBox="0 0 24 24">
                <path d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M4,6V18H20V6H4M6,9H8V11H10V13H8V15H6V13H4V11H6V9M16.5,12A2.5,2.5 0 0,1 19,14.5A2.5,2.5 0 0,1 16.5,17A2.5,2.5 0 0,1 14,14.5A2.5,2.5 0 0,1 16.5,12M16.5,14A0.5,0.5 0 0,0 16,14.5A0.5,0.5 0 0,0 16.5,15A0.5,0.5 0 0,0 17,14.5A0.5,0.5 0 0,0 16.5,14Z" />
              </svg>
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Insights;