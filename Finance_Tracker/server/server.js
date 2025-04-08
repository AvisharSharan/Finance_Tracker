const express = require('express');
const db = require('./db');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// ==========================
// USER AUTHENTICATION
// ==========================

// User Registration
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO user (name, email, password)
    VALUES (?, ?, ?)
  `;
  db.query(query, [name, email, password], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = `
    SELECT * FROM user WHERE email = ? AND password = ?
  `;
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', user: results[0] });
  });
});


// ==========================
// INITIAL SETUP API
// ==========================
app.post('/api/setup', (req, res) => {
  const { userId, totalBalance, incomeSource, incomeAmount } = req.body;

  const insertFinancialsQuery = `
    INSERT INTO user_financials (user_id, total_balance, total_income, total_expense, total_savings)
    VALUES (?, ?, ?, 0, 0)
  `;
  const insertIncomeSourceQuery = `
    INSERT INTO income_source (source_name)
    VALUES (?)
  `;
  db.query(insertFinancialsQuery, [userId, totalBalance, incomeAmount], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query(insertIncomeSourceQuery, [incomeSource], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: 'Initial setup completed successfully' });
    });
  });
});

// ==========================
// DASHBOARD API
// ==========================
// Dashboard API
app.get('/api/dashboard', async (req, res) => {
  const userId = req.query.userId || 1; // Replace with dynamic user ID if needed

  try {
    // Query to calculate total balance
    const totalBalanceQuery = `
      SELECT 
        (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) AS totalBalance
      FROM transaction
      WHERE user_id = ?
    `;

    // Query to calculate total income and expense
    const incomeExpenseQuery = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
      FROM transaction
      WHERE user_id = ?
    `;

    // Query to calculate total savings
    const totalSavingsQuery = `
      SELECT 
        SUM(saved_amount) AS totalSavings
      FROM goal
      WHERE user_id = ?
    `;

    // Query to fetch recent transactions
    const recentTransactionsQuery = `
      SELECT 
        t.transaction_id, 
        t.date, 
        t.amount, 
        t.description, 
        t.type, 
        c.category_name
      FROM 
        transaction t
      LEFT JOIN 
        category c ON t.category_id = c.category_id
      WHERE 
        t.user_id = ?
      ORDER BY 
        t.date DESC
      LIMIT 5
    `;

    // Query to fetch saving goals
    const savingGoalsQuery = `
      SELECT 
        goal_id, goal_name AS name, target_amount AS target, saved_amount AS saved
      FROM goal
      WHERE user_id = ?
    `;

    // Execute all queries
    const [totalBalanceResult] = await db.promise().query(totalBalanceQuery, [userId]);
    const [incomeExpenseResult] = await db.promise().query(incomeExpenseQuery, [userId]);
    const [totalSavingsResult] = await db.promise().query(totalSavingsQuery, [userId]);
    const [recentTransactionsResult] = await db.promise().query(recentTransactionsQuery, [userId]);
    const [savingGoalsResult] = await db.promise().query(savingGoalsQuery, [userId]);

    // Combine results into a single response object
    const response = {
      totalBalance: totalBalanceResult[0]?.totalBalance || 0,
      income: incomeExpenseResult[0]?.income || 0,
      expense: incomeExpenseResult[0]?.expense || 0,
      totalSavings: totalSavingsResult[0]?.totalSavings || 0,
      recentTransactions: recentTransactionsResult,
      savingGoals: savingGoalsResult,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================
// BUDGET API
// ==========================
app.get('/api/budgets', (req, res) => {
  const userId = req.query.userId || 1;

  const query = `
    SELECT b.budget_id, c.category_name, b.monthly_limit, 
           (SELECT SUM(t.amount) 
            FROM transaction t 
            WHERE t.category_id = b.category_id AND t.user_id = b.user_id) AS spent
    FROM budget b
    JOIN category c ON b.category_id = c.category_id
    WHERE b.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching budgets:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

app.post('/api/budgets', (req, res) => {
  const { userId, category_id, monthly_limit } = req.body;

  if (!userId || !category_id || !monthly_limit) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO budget (user_id, category_id, monthly_limit)
    VALUES (?, ?, ?)
  `;

  db.query(query, [userId, category_id, monthly_limit], (err, results) => {
    if (err) {
      console.error('Error adding budget:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json({ message: 'Budget added successfully', budgetId: results.insertId });
  });
});

app.put('/api/budgets/:id', (req, res) => {
  const { id } = req.params;
  const { monthly_limit } = req.body;

  if (!monthly_limit) {
    return res.status(400).json({ error: 'Monthly limit is required' });
  }

  const query = `
    UPDATE budget
    SET monthly_limit = ?
    WHERE budget_id = ?
  `;

  db.query(query, [monthly_limit, id], (err, results) => {
    if (err) {
      console.error('Error updating budget:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget updated successfully' });
  });
});

app.delete('/api/budgets/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM budget
    WHERE budget_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting budget:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  });
});

// ==========================
// CATEGORY API
// ==========================
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM category';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ==========================
// GOALS API
// ==========================
app.get('/api/goals', (req, res) => {
  const userId = req.query.userId || 1;
  const query = `
    SELECT goal_id, goal_name AS name, target_amount AS target, saved_amount AS saved, deadline
    FROM goal
    WHERE user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Insert a goal
app.post('/api/goals', (req, res) => {
  const { userId, name, target, deadline } = req.body;
  const query = `
    INSERT INTO goal (user_id, goal_name, target_amount, saved_amount, deadline)
    VALUES (?, ?, ?, 0, ?)
  `;
  db.query(query, [userId, name, target, deadline], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Goal added successfully', goalId: results.insertId });
  });
});

// Update Saved Amount for a Goal
app.put('/api/goals/:id/savings', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const query = `
    UPDATE goal
    SET saved_amount = saved_amount + ?
    WHERE goal_id = ?
  `;

  db.query(query, [amount, id], (err, results) => {
    if (err) {
      console.error('Error updating savings:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Savings updated successfully' });
  });
});

// Delete a Goal
app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params; // Goal ID

  const query = `
    DELETE FROM goal
    WHERE goal_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting goal:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  });
});

// ==========================
// TRANSACTION API
// ==========================

// Fetch Transactions
app.get('/api/transactions', (req, res) => {
  const userId = req.query.userId || 1;

  const query = `
    SELECT 
      t.transaction_id, 
      t.date, 
      t.amount, 
      t.type, 
      t.description, 
      c.category_name
    FROM 
      transaction t
    LEFT JOIN 
      category c ON t.category_id = c.category_id
    WHERE 
      t.user_id = ?
    ORDER BY 
      t.date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Add Transaction
app.post('/api/transactions', (req, res) => {
  const { userId, date, amount, category, type, description } = req.body;

  if (!userId || !date || !amount || !category || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO transaction (user_id, category_id, amount, date, type, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [userId, category, amount, date, type, description], (err, results) => {
    if (err) {
      console.error('Error adding transaction:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json({ message: 'Transaction added successfully', transactionId: results.insertId });
  });
});

// Edit Transaction
app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params; // Transaction ID
  const { date, amount, category, type, description } = req.body;

  if (!date || !amount || !category || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    UPDATE transaction
    SET date = ?, amount = ?, category_id = ?, type = ?, description = ?
    WHERE transaction_id = ?
  `;

  db.query(query, [date, amount, category, type, description, id], (err, results) => {
    if (err) {
      console.error('Error updating transaction:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction updated successfully' });
  });
});

// Delete Transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params; // Transaction ID

  const query = `
    DELETE FROM transaction
    WHERE transaction_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting transaction:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  });
});

// ==========================
// INSIGHTS API
// ==========================
// Income vs Expense API
app.get('/api/insights/income-expense', (req, res) => {
  const userId = req.query.userId || 1; // Dynamic user ID

  const query = `
    SELECT 
      DATE_FORMAT(date, '%M %Y') AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM transaction
    WHERE user_id = ?
    GROUP BY YEAR(date), MONTH(date)
    ORDER BY YEAR(date), MONTH(date)
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching income vs expense data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Category-Wise Spending API
app.get('/api/insights/category-spending', (req, res) => {
  const userId = req.query.userId || 1; // Dynamic user ID

  const query = `
    SELECT 
      c.category_name AS category,
      SUM(t.amount) AS amount
    FROM transaction t
    LEFT JOIN category c ON t.category_id = c.category_id
    WHERE t.user_id = ? AND t.type = 'expense'
    GROUP BY t.category_id
    ORDER BY amount DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching category-wise spending data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Savings Trend API
app.get('/api/insights/savings-trend', (req, res) => {
  const userId = req.query.userId || 1; // Dynamic user ID

  const query = `
    SELECT 
      DATE_FORMAT(date, '%M %Y') AS month,
      (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) AS savings
    FROM transaction
    WHERE user_id = ?
    GROUP BY YEAR(date), MONTH(date)
    ORDER BY YEAR(date), MONTH(date)
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching savings trend data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Top Spending Categories API
app.get('/api/insights/top-categories', (req, res) => {
  const userId = req.query.userId || 1; // Dynamic user ID

  const query = `
    SELECT 
      c.category_name AS category,
      SUM(t.amount) AS amount
    FROM transaction t
    LEFT JOIN category c ON t.category_id = c.category_id
    WHERE t.user_id = ? AND t.type = 'expense'
    GROUP BY t.category_id
    ORDER BY amount DESC
    LIMIT 5
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching top spending categories:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});


// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});