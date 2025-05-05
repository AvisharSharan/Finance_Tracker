import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

// Import SVG icons
import DashboardIcon from '../assets/icons/dash.svg';
import BudgetIcon from '../assets/icons/budget.svg';
import GoalsIcon from '../assets/icons/goals.svg';
import InsightsIcon from '../assets/icons/insights.svg';
import TransactionsIcon from '../assets/icons/transaction.svg';

// Import logo
import Logo from '../assets/icons/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/dashboard');

  // Track active route for animation effects
  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Navigation menu items
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: DashboardIcon },
    { path: '/budget', name: 'Budget', icon: BudgetIcon },
    { path: '/goals', name: 'Goals', icon: GoalsIcon },
    { path: '/insights', name: 'Insights', icon: InsightsIcon },
    { path: '/transactions', name: 'Transactions', icon: TransactionsIcon }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-inner">
        {/* Header with toggle and logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={Logo} alt="FinTrack" className="logo" />
            {!isCollapsed && <h1 className="app-title">FinTrack</h1>}
          </div>
          <button 
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg viewBox="0 0 24 24" className="toggle-icon">
              {isCollapsed ? (
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
              ) : (
                <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
              )}
            </svg>
          </button>
        </div>

        {/* Main navigation */}
        <nav className="sidebar-nav">
          <div className="nav-wrapper">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={item.name}
              >
                <div className="nav-icon-wrapper">
                  <img src={item.icon} alt={item.name} className="nav-icon" />
                  {activeRoute === item.path && <div className="active-indicator"></div>}
                </div>
                {!isCollapsed && <span className="nav-label">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section and logout */}
        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-avatar">
              <span>FT</span>
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <p className="user-name">User</p>
                <p className="user-status">Active</p>
              </div>
            )}
          </div>
          
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <svg viewBox="0 0 24 24" className="logout-icon">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;