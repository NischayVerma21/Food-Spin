// src/components/HomePage.js
import React, { useState } from 'react';
import Navbar from './HomeComponents/Navbar';
import WheelComponent from './HomeComponents/WheelComponent';
import HistoryComponent from './HomeComponents/HistoryComponent';
import FavoritesComponent from './HomeComponents/FavoritesComponent';
import ProfileComponent from './HomeComponents/ProfileComponent';
import CuisineSection from './HomeComponents/CuisineSection';
import Footer from './Footer';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('wheel');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-gray-900 dark:to-black transition-all duration-500">
      
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* ✅ INCREASED PADDING: pt-24 to pt-32 for better spacing */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          
          {/* Dynamic Content Based on Active Tab */}
          <div className="min-h-screen">
            {activeTab === 'wheel' && (
              <div className="space-y-12">
                <WheelComponent />
                <CuisineSection />
              </div>
            )}
            
            {activeTab === 'history' && <HistoryComponent />}
            {activeTab === 'favorites' && <FavoritesComponent />}
            {activeTab === 'profile' && <ProfileComponent />}
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
