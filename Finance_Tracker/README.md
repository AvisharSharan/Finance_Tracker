# Finance Tracker

A modern web application for tracking personal finances, managing budgets, setting financial goals, and gaining insights into spending patterns.

![Finance Tracker Logo](./src/assets/icons/logo.png)

## Features

- **Dashboard**: Overview of your financial health with key metrics at a glance
- **Transactions**: Add, edit, delete and search your income and expense transactions
- **Budget**: Create and manage budgets for different expense categories
- **Goals**: Set savings goals with deadlines and track your progress
- **Insights**: Visualize your financial data with interactive charts and trends

## Tech Stack

### Frontend
- React.js
- Axios for API requests
- Recharts for data visualization
- Modern CSS with custom styling

### Backend
- Node.js
- Express.js
- MySQL database

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Finance_Tracker
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd ../server
npm install
```

4. Set up the database
- Create a MySQL database
- Configure the connection details in `server/db.js`

5. Start the backend server
```bash
cd server
nodemon server.js
```

6. Start the frontend application
```bash
cd client
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
Finance_Tracker/
├── client/                  # Frontend React application
│   ├── public/              # Static files
│   └── src/
│       ├── assets/          # Images, icons, etc.
│       ├── components/      # React components
│       └── styles/          # CSS stylesheets
└── server/                  # Backend Node.js application
    ├── db.js                # Database connection
    └── server.js            # Express server
```

## Usage

1. **Registration/Login**: Create an account and log in to start tracking your finances
2. **Dashboard**: View your financial summary and recent transactions
3. **Transactions**: Add your income and expenses with categories and descriptions
4. **Budget**: Set monthly budgets for different spending categories
5. **Goals**: Create savings goals and track your progress towards them
6. **Insights**: Analyze your spending patterns and financial trends

## Screenshots

<!-- Add screenshots of your application here -->

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons from [Material Design Icons](https://materialdesignicons.com/)
- Charts powered by [Recharts](https://recharts.org/)