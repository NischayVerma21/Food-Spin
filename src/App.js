// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-gray-900 dark:to-black transition-all duration-500">
        <div className="text-white text-2xl animate-pulse">Loading FoodSpin... 🍕</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" />;
};

// Main App Layout
const AppLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-gray-900 dark:to-black transition-all duration-500">
        <Header />
        <main className="pt-16">
          <LandingPage />
        </main>
        <Footer />
      </div>
    );
  }

  // After login - show HomePage with all functionality
  return <HomePage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<AppLayout />} />
              {/* Add more routes here as needed */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
