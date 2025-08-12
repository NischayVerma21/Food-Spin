// src/components/HomeComponents/FavoritesComponent.js
import React, { useState, useEffect } from 'react';

const FavoritesComponent = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('foodspin-token');
      const response = await fetch('https://food-spin-backend.onrender.com/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Favorites data:', data);
        setFavorites(data.favorites || []);
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      const token = localStorage.getItem('foodspin-token');
      const response = await fetch(`https://food-spin-backend.onrender.com/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav._id !== favoriteId));
        alert('Removed from favorites! 🗑️');
      } else {
        alert('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      alert('Error removing favorite');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-2xl animate-pulse">Loading favorites... ❤️</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          ❤️ Your Favorite Dishes
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Your curated collection of delicious discoveries
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-2xl font-bold text-white mb-2">No favorites yet!</h3>
          <p className="text-gray-400 mb-6">Start spinning and mark dishes as favorites to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite._id} className="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-3xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105">
              
              {/* Dish Icon */}
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">
                  {favorite.fromWheelResult ? '🎯' : '❤️'}
                </div>
              </div>
              
              {/* Dish Name */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                {favorite.dishName}
              </h3>
              
              {/* Details */}
              <div className="space-y-2 text-sm text-gray-300 mb-4">
                {favorite.cuisineType && (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🍴</span>
                    <span>{favorite.cuisineType}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center space-x-2">
                  <span>📅</span>
                  <span>{new Date(favorite.addedAt).toLocaleDateString()}</span>
                </div>
                
                {favorite.fromWheelResult && (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎰</span>
                    <span>From wheel result</span>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => removeFavorite(favorite._id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesComponent;
