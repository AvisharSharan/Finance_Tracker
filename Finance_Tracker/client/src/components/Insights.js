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

  // Fetch insights data from the backend
  useEffect(() => {
    const fetchInsights = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.user_id;
  
      if (!userId) {
        console.error('User ID is missing');
        return;
      }
  
      try {
        console.log("Fetching insights data for user ID:", userId);

        const incomeExpenseResponse = await axios.get(`http://localhost:5000/api/insights/income-expense?userId=${userId}`);
        console.log("Raw income/expense data:", incomeExpenseResponse.data);

        const categoryResponse = await axios.get(`http://localhost:5000/api/insights/category-spending?userId=${userId}`);
        console.log("Raw category data:", categoryResponse.data);

        const savingsTrendResponse = await axios.get(`http://localhost:5000/api/insights/savings-trend?userId=${userId}`);
        console.log("Raw savings trend data:", savingsTrendResponse.data);

        const topCategoriesResponse = await axios.get(`http://localhost:5000/api/insights/top-categories?userId=${userId}`);
        console.log("Raw top categories data:", topCategoriesResponse.data);
        
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
        
        console.log('Processed data:', { 
          incomeExpense: incomeExpenseProcessed,
          category: categoryProcessed,
          savingsTrend: savingsTrendProcessed,
          topCategories: topCategoriesProcessed 
        });

        // Check if there's any data for the charts
        console.log("Data counts:", {
          incomeExpense: incomeExpenseProcessed.length,
          category: categoryProcessed.length,
          savingsTrend: savingsTrendProcessed.length,
          topCategories: topCategoriesProcessed.length
        });
      } catch (error) {
        console.error('Error fetching insights data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Status:', error.response.status);
        }
      }
    };
  
    fetchInsights();
  }, []);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1'];

  return (
    <div className="insights-container">
      <h2 className="page-title">Insights</h2>
  
      {/* Key Insights Section */}
      <div className="key-insights">
        <div className="insight-card">
          <h3>Total Income</h3>
          <p>${incomeExpenseData.reduce((acc, curr) => acc + curr.income, 0).toLocaleString()}</p>
        </div>
        <div className="insight-card">
          <h3>Total Expense</h3>
          <p>${incomeExpenseData.reduce((acc, curr) => acc + curr.expense, 0).toLocaleString()}</p>
        </div>
        <div className="insight-card">
          <h3>Net Savings</h3>
          <p>${(
          incomeExpenseData.reduce((acc, curr) => acc + curr.income, 0) -
          incomeExpenseData.reduce((acc, curr) => acc + curr.expense, 0)
          ).toLocaleString()}</p>
        </div>
      </div>
  
      {/* Charts Section */}
      <div className="charts-grid">
        {/* Income vs Expense Chart */}
        <div className="chart-card">
          <h3>Income vs Expense</h3>
          {incomeExpenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#82ca9d" />
                <Bar dataKey="expense" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No income/expense data available</div>
          )}
        </div>
  
        {/* Category-Wise Spending Chart */}
        <div className="chart-card">
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
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No category spending data available</div>
          )}
        </div>
      </div>
  
      {/* Trends Section */}
      <div className="trends-grid">
        {/* Savings Trend */}
        <div className="chart-card">
          <h3>Savings Trend</h3>
          {savingsTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#6c5ce7" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No savings trend data available</div>
          )}
        </div>
  
        {/* Top Spending Categories */}
        <div className="chart-card">
          <h3>Top Spending Categories</h3>
          {topCategories.length > 0 ? (
            <ul className="top-categories-list">
              {topCategories.map((category, index) => (
                <li key={index}>
                  <span className="category-name">{category.category}</span>
                  <span className="category-amount">${category.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-data-message">No category data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Insights;