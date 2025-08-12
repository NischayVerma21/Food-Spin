// src/components/Footer.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-4 transition-colors">
              🎰 FoodSpin
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
              The ultimate food decision maker! Spin the wheel, vote for your favorites, 
              and discover your next meal adventure with our intelligent voting system.
            </p>
            <div className="flex space-x-3">
              <span className="text-3xl hover:scale-110 transition-transform cursor-pointer">🎲</span>
              <span className="text-3xl hover:scale-110 transition-transform cursor-pointer">🗳️</span>
              <span className="text-3xl hover:scale-110 transition-transform cursor-pointer">❤️</span>
              <span className="text-3xl hover:scale-110 transition-transform cursor-pointer">📜</span>
              <span className="text-3xl hover:scale-110 transition-transform cursor-pointer">🍕</span>
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-lg">Core Features</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">🎰</span> Interactive Spin Wheel
              </li>
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">🗳️</span> Real-time Voting System
              </li>
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">📊</span> Probability-based Selection
              </li>
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">⚡</span> Instant Decision Making
              </li>
            </ul>
          </div>

          {/* Smart Features */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-lg">Smart Features</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">❤️</span> Favorites Management
              </li>
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">📜</span> Spin History Tracking
              </li>
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">🔄</span> Vote Reset & Control
              </li>
              <li className="flex items-center hover:text-orange-500 transition-colors cursor-pointer">
                <span className="mr-2">🌙</span> Dark/Light Mode
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 transition-all hover:scale-105 border border-orange-200/50 dark:border-orange-700/30">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-1">Smart Algorithm</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">70% top votes, 30% fair chance</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 transition-all hover:scale-105 border border-blue-200/50 dark:border-blue-700/30">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">Real-time Sync</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Live vote updates & history</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 transition-all hover:scale-105 border border-green-200/50 dark:border-green-700/30">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">Modern UI</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Glass-morphism & animations</div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-6">How FoodSpin Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Add Dishes</div>
              <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">Up to 12 options</div>
            </div>
            <div className="group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🗳️</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Vote & Decide</div>
              <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">Real-time voting</div>
            </div>
            <div className="group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎰</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Spin the Wheel</div>
              <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">Smart probability</div>
            </div>
            <div className="group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎉</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Enjoy Result</div>
              <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">Save to favorites</div>
            </div>
          </div>
        </div>

        

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 FoodSpin. Made with ❤️ for food decision-makers everywhere.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400 dark:text-gray-500">
                Current theme: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded transition-colors">
                  {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </span>
              </span>
              <a href="mailto:help@foodspin.com" className="text-orange-500 hover:text-orange-600 transition-colors">
                📧 Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
