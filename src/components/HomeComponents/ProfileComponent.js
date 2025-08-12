// src/components/HomeComponents/ProfileComponent.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileComponent = () => {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          👤 Your Profile
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Information */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">ℹ️</span>
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Full Name
              </label>
              <div className="bg-black/20 border border-white/20 text-white px-4 py-3 rounded-xl">
                {user?.name}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="bg-black/20 border border-white/20 text-white px-4 py-3 rounded-xl">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">🔒</span>
            Security Settings
          </h2>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🛡️</div>
            <p className="text-gray-300 mb-6">
              Keep your account secure by regularly updating your password
            </p>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
