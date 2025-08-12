// src/components/Header.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Function to scroll to the auth form
  const handleGetStarted = () => {
    const authForm = document.getElementById('auth-form');
    if (authForm) {
      authForm.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Optional: Add a slight delay and focus the email input
      setTimeout(() => {
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) {
          emailInput.focus();
        }
      }, 500);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 backdrop-blur-xl bg-slate-900/90 dark:bg-black/90 shadow-2xl z-50 transition-all duration-300 border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent transition-colors duration-300">
          🍕 FoodSpin
        </div>
        
        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group backdrop-blur-sm border border-white/20"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* User Menu or Get Started Button */}
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-medium transition-colors">
                Welcome, {user.name}!
              </span>
              <button 
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
