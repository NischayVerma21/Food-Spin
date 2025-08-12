// src/components/LandingPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const { login, signup } = useAuth();

  // Array of texts that will fade in and out
  const fadingTexts = [
    "Perfect Bite!",
    "Favorite Meal!",
    "Culinary Adventure!",
    "Food Experience!",
    "Dream Dish!"
  ];

  // Text rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % fadingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [fadingTexts.length]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-gray-900 dark:to-black transition-all duration-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-12"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Hero Content with Text Animations */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              {/* Typewriter Text */}
              <div className="text-5xl lg:text-6xl font-bold leading-tight">
                <div className="overflow-hidden border-r-4 border-amber-400 dark:border-amber-300 pr-2 animate-typewriter whitespace-nowrap">
                  Spin to Select Your
                </div>
                
                {/* Fading/Changing Text */}
                <div className="relative h-20 lg:h-24 mt-4">
                  {fadingTexts.map((text, index) => (
                    <span
                      key={index}
                      className={`absolute top-0 left-0 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-300 dark:to-orange-400 transition-all duration-1000 ${
                        index === currentTextIndex
                          ? 'opacity-100 transform translate-y-0'
                          : 'opacity-0 transform translate-y-4'
                      }`}
                    >
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Animated Subtitle */}
              <p className="text-xl text-gray-300 dark:text-gray-400 max-w-2xl leading-relaxed animate-fadeInUp opacity-0" 
                 style={{ animation: 'fadeInUp 1s ease-out 2s forwards' }}>
                Hungry but can't decide? Let our intelligent food selector guide your taste buds! 
                From local favorites to hidden culinary gems - your next amazing meal is just one spin away.
              </p>
            </div>

            {/* Animated Food Icons */}
            <div className="flex space-x-4 text-5xl lg:text-6xl animate-fadeInUp opacity-0" 
                 style={{ animation: 'fadeInUp 1s ease-out 3s forwards' }}>
              <span className="animate-bounce hover:scale-125 transition-transform cursor-pointer filter drop-shadow-lg" 
                    style={{ animationDelay: '0.1s' }}>🍕</span>
              <span className="animate-bounce hover:scale-125 transition-transform cursor-pointer filter drop-shadow-lg" 
                    style={{ animationDelay: '0.2s' }}>🍔</span>
              <span className="animate-bounce hover:scale-125 transition-transform cursor-pointer filter drop-shadow-lg" 
                    style={{ animationDelay: '0.3s' }}>🍣</span>
              <span className="animate-bounce hover:scale-125 transition-transform cursor-pointer filter drop-shadow-lg" 
                    style={{ animationDelay: '0.4s' }}>🌮</span>
              <span className="animate-bounce hover:scale-125 transition-transform cursor-pointer filter drop-shadow-lg" 
                    style={{ animationDelay: '0.5s' }}>🍜</span>
            </div>

            {/* Call to Action Text */}
            <div className="animate-fadeInUp opacity-0" style={{ animation: 'fadeInUp 1s ease-out 4s forwards' }}>
              <p className="text-2xl font-semibold text-gray-200 mb-4">
                Ready to discover something delicious? 
              </p>
              <p className="text-lg text-gray-400">
                Join thousands of food lovers who let fate decide their meals! →
              </p>
            </div>

            {/* Stats Section - Fixed Version */}
            <div className="grid grid-cols-3 gap-4 text-center animate-fadeInUp opacity-0" 
                 style={{ animation: 'fadeInUp 1s ease-out 5s forwards' }}>
              <div className="backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-xl p-4 border border-white/20 dark:border-white/10 shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-amber-400">∞</div>
                <div className="text-gray-300 text-sm">Random Picks</div>
              </div>
              <div className="backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-xl p-4 border border-white/20 dark:border-white/10 shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-rose-400">24/7</div>
                <div className="text-gray-300 text-sm">Available</div>
              </div>
              <div className="backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-xl p-4 border border-white/20 dark:border-white/10 shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-emerald-400">100%</div>
                <div className="text-gray-300 text-sm">Free to Use</div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form Card */}
          <div className="flex justify-center animate-slideInRight opacity-0" 
               style={{ animation: 'slideInRight 1s ease-out 1s forwards' }}
               id="auth-form">
            <div className="w-full max-w-md">
              <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-white/10 transition-all duration-300 transform hover:scale-105">
                
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4 animate-bounce">🎰</div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back!' : 'Join FoodSpin!'}
                  </h2>
                  <p className="text-gray-300 dark:text-gray-400">
                    {isLogin ? 'Ready to select your next amazing meal?' : 'Start your culinary adventure today!'}
                  </p>
                </div>

                {/* Form Toggle Buttons */}
                <div className="flex mb-6 bg-black/20 dark:bg-black/40 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      isLogin
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsLogin(true)}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      !isLogin
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-sm backdrop-blur-sm">
                    <div className="flex items-center">
                      <span className="mr-2">⚠️</span>
                      {error}
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-white/20 dark:border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-white/20 dark:border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="6"
                      className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-white/20 dark:border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                      </div>
                    ) : (
                      <>
                        {isLogin ? '🚀 Start Selecting!' : '🎉 Join the Adventure!'}
                      </>
                    )}
                  </button>
                </form>

                {/* Switch Mode Link */}
                <div className="mt-6 text-center text-sm text-gray-400">
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors hover:underline"
                  >
                    {isLogin 
                      ? "New to FoodSpin? Create an account" 
                      : "Already have an account? Sign in instead"
                    }
                  </button>
                </div>

                {/* Security Badge */}
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center text-xs text-gray-500">
                    <span className="mr-1">🔒</span>
                    Your data is secure and encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
