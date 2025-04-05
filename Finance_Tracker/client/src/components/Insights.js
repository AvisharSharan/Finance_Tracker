import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../styles/Insights.css';

const Insights = () => {
  const [incomeExpenseData, setIncomeExpenseData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Fetch insights data from the backend
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const incomeExpenseResponse = await axios.get('http://localhost:5000/api/insights/income-expense');
        const categoryResponse = await axios.get('http://localhost:5000/api/insights/category-spending');
        setIncomeExpenseData(incomeExpenseResponse.data);
        setCategoryData(categoryResponse.data);
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
    </div>
  );
};

export default Insights;