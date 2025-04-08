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
      try {
        const incomeExpenseResponse = await axios.get('http://localhost:5000/api/insights/income-expense');
        const categoryResponse = await axios.get('http://localhost:5000/api/insights/category-spending');
        const savingsTrendResponse = await axios.get('http://localhost:5000/api/insights/savings-trend');
        const topCategoriesResponse = await axios.get('http://localhost:5000/api/insights/top-categories');
  
        console.log('Income vs Expense Data:', incomeExpenseResponse.data);
        console.log('Category Data:', categoryResponse.data);
        console.log('Savings Trend Data:', savingsTrendResponse.data);
        console.log('Top Categories Data:', topCategoriesResponse.data);
  
        setIncomeExpenseData(incomeExpenseResponse.data);
        setCategoryData(categoryResponse.data);
        setSavingsTrendData(savingsTrendResponse.data);
        setTopCategories(topCategoriesResponse.data);
      } catch (error) {
        console.error('Error fetching insights data:', error);
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
          <p>${(incomeExpenseData.reduce((acc, curr) => acc + curr.income, 0) - incomeExpenseData.reduce((acc, curr) => acc + curr.expense, 0)).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Income vs Expense Chart */}
        <div className="chart-card">
          <h3>Income vs Expense</h3>
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
        </div>

        {/* Category-Wise Spending Chart */}
        <div className="chart-card">
          <h3>Category-Wise Spending</h3>
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
        </div>
      </div>

      {/* Trends Section */}
      <div className="trends-grid">
        {/* Savings Trend */}
        <div className="chart-card">
          <h3>Savings Trend</h3>
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
        </div>

        {/* Top Spending Categories */}
        <div className="chart-card">
          <h3>Top Spending Categories</h3>
          <ul className="top-categories-list">
            {topCategories.map((category, index) => (
              <li key={index}>
                <span className="category-name">{category.category}</span>
                <span className="category-amount">${category.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Insights;