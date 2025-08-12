// src/components/HomeComponents/CuisineSection.js
import React, { useState, useEffect, useCallback } from 'react';

const CuisineSection = () => {
  const [cuisines, setCuisines] = useState([]);
  const [recommendedFoods, setRecommendedFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingDish, setAddingDish] = useState(null);

  // ✅ FIXED: Define helper functions FIRST (before they're used)

  // ✅ Set default recommendations for first-time users
  const setDefaultRecommendations = useCallback(() => {
    setRecommendedFoods([
      { id: 1, name: 'Margherita Pizza', cuisine: 'Italian', rating: 4.8, image: '🍕', votes: 0, isWinner: false, isFavorite: false },
      { id: 2, name: 'Chicken Ramen', cuisine: 'Japanese', rating: 4.7, image: '🍜', votes: 0, isWinner: false, isFavorite: false },
      { id: 3, name: 'Fish Tacos', cuisine: 'Mexican', rating: 4.6, image: '🌮', votes: 0, isWinner: false, isFavorite: false },
      { id: 4, name: 'Butter Chicken', cuisine: 'Indian', rating: 4.9, image: '🍛', votes: 0, isWinner: false, isFavorite: false },
      { id: 5, name: 'Classic Burger', cuisine: 'American', rating: 4.5, image: '🍔', votes: 0, isWinner: false, isFavorite: false },
      { id: 6, name: 'Pad Thai', cuisine: 'Thai', rating: 4.7, image: '🍝', votes: 0, isWinner: false, isFavorite: false }
    ]);
  }, []);

  // ✅ Detect cuisine type from dish name
  const detectCuisine = useCallback((dishName) => {
    const dishLower = dishName.toLowerCase();
    
    const cuisineMap = {
      'Italian': { keywords: ['pizza', 'pasta', 'risotto', 'lasagna', 'carbonara'], icon: '🍕' },
      'Japanese': { keywords: ['sushi', 'ramen', 'tempura', 'miso', 'teriyaki'], icon: '🍣' },
      'Mexican': { keywords: ['taco', 'burrito', 'quesadilla', 'enchilada', 'nacho'], icon: '🌮' },
      'Indian': { keywords: ['curry', 'biryani', 'naan', 'tikka', 'masala'], icon: '🍛' },
      'Chinese': { keywords: ['dumpling', 'fried rice', 'noodles', 'chow mein', 'wonton'], icon: '🥟' },
      'American': { keywords: ['burger', 'bbq', 'wings', 'fries', 'hot dog'], icon: '🍔' },
      'Thai': { keywords: ['pad thai', 'tom yum', 'green curry', 'som tam'], icon: '🍜' },
      'Mediterranean': { keywords: ['hummus', 'falafel', 'gyros', 'kebab'], icon: '🥙' }
    };

    for (const [cuisine, data] of Object.entries(cuisineMap)) {
      if (data.keywords.some(keyword => dishLower.includes(keyword))) {
        return { name: cuisine, icon: data.icon };
      }
    }

    return { name: 'International', icon: '🍽️' };
  }, []);

  // ✅ Calculate rating based on votes and favorite status
  const calculateRating = useCallback((votes, isFavorite) => {
    let baseRating = 4.0;
    
    if (isFavorite) baseRating += 0.5;
    if (votes > 5) baseRating += 0.2;
    if (votes > 10) baseRating += 0.2;
    
    return Math.min(5.0, parseFloat(baseRating.toFixed(1)));
  }, []);

  // ✅ Generate smart suggestions based on preferences
  const generateSmartSuggestions = useCallback((cuisinePreferences, existing, count) => {
    const existingNames = existing.map(item => item.name.toLowerCase());
    
    const suggestions = [
      { name: 'Margherita Pizza', cuisine: 'Italian', icon: '🍕', rating: 4.8 },
      { name: 'Chicken Ramen', cuisine: 'Japanese', icon: '🍜', rating: 4.7 },
      { name: 'Fish Tacos', cuisine: 'Mexican', icon: '🌮', rating: 4.6 },
      { name: 'Butter Chicken', cuisine: 'Indian', icon: '🍛', rating: 4.9 },
      { name: 'Classic Burger', cuisine: 'American', icon: '🍔', rating: 4.5 },
      { name: 'Pad Thai', cuisine: 'Thai', icon: '🍝', rating: 4.7 },
      { name: 'Caesar Salad', cuisine: 'International', icon: '🥗', rating: 4.4 },
      { name: 'Grilled Salmon', cuisine: 'International', icon: '🐟', rating: 4.6 },
      { name: 'Chocolate Cake', cuisine: 'International', icon: '🍰', rating: 4.7 },
      { name: 'Greek Salad', cuisine: 'Mediterranean', icon: '🥙', rating: 4.3 }
    ];

    return suggestions
      .filter(item => !existingNames.includes(item.name.toLowerCase()))
      .map((item, index) => ({
        id: `smart-${index}`,
        name: item.name,
        cuisine: item.cuisine,
        rating: item.rating,
        image: item.icon,
        votes: 0,
        isWinner: false,
        isFavorite: false
      }))
      .slice(0, count);
  }, []);

  // ✅ Generate intelligent recommendations from user history
  const generateIntelligentRecommendations = useCallback((history, favorites) => {
    const winnerDishes = [];
    const cuisinePreferences = {};

    // Extract winners from history
    history.forEach(entry => {
      if (entry.winner?.name) {
        winnerDishes.push({
          name: entry.winner.name,
          votes: entry.winner.totalVotes || 0,
          timestamp: entry.spunAt
        });
      }
      
      // Track cuisine preferences
      if (entry.dishes) {
        entry.dishes.forEach(dish => {
          if (dish.cuisineType && dish.cuisineType !== 'Unknown') {
            cuisinePreferences[dish.cuisineType] = (cuisinePreferences[dish.cuisineType] || 0) + 1;
          }
        });
      }
    });

    // Add favorites to recommendations
    const favoriteDishes = favorites.map(fav => ({
      name: fav.dishName,
      votes: 0,
      isFavorite: true
    }));

    // Combine and create recommendations
    const allRecommendations = [...winnerDishes, ...favoriteDishes];
    
    // Create enhanced recommendations with cuisine mapping
    const enhancedRecommendations = allRecommendations.map((dish, index) => {
      const cuisine = detectCuisine(dish.name);
      const rating = calculateRating(dish.votes, dish.isFavorite);
      
      return {
        id: `rec-${index}`,
        name: dish.name,
        cuisine: cuisine.name,
        rating: rating,
        image: cuisine.icon,
        votes: dish.votes || 0,
        isWinner: !!dish.timestamp,
        isFavorite: !!dish.isFavorite
      };
    });

    // Remove duplicates and limit to 6 items
    const uniqueRecommendations = enhancedRecommendations
      .filter((item, index, self) => 
        index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
      )
      .slice(0, 6);

    // Fill remaining slots with smart suggestions if needed
    if (uniqueRecommendations.length < 6) {
      const smartSuggestions = generateSmartSuggestions(
        cuisinePreferences,
        uniqueRecommendations,
        6 - uniqueRecommendations.length
      );
      uniqueRecommendations.push(...smartSuggestions);
    }

    return uniqueRecommendations.slice(0, 6);
  }, [calculateRating, detectCuisine, generateSmartSuggestions]);

  // ✅ Enhanced success message with better styling
  const showSuccessMessage = useCallback((dishName) => {
    // Remove any existing success messages
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());

    // Create temporary success element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10B981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideInSuccess 0.4s ease-out;
        font-family: 'Poppins', sans-serif;
        max-width: 300px;
        word-wrap: break-word;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">✅</span>
          <span>${dishName} added to wheel!</span>
        </div>
      </div>
      <style>
        @keyframes slideInSuccess {
          from { 
            transform: translateX(100%) scale(0.8); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0) scale(1); 
            opacity: 1; 
          }
        }
        @keyframes fadeOutSuccess {
          from { 
            transform: translateX(0) scale(1); 
            opacity: 1; 
          }
          to { 
            transform: translateX(100%) scale(0.8); 
            opacity: 0; 
          }
        }
      </style>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove after 4 seconds with fade out animation
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        successDiv.firstElementChild.style.animation = 'fadeOutSuccess 0.3s ease-in forwards';
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 300);
      }
    }, 4000);
  }, []);

  // ✅ FIXED: Fetch recommended foods based on spin winners and history (NOW all dependencies are defined above)
  const fetchRecommendedFoods = useCallback(async () => {
    try {
      const token = localStorage.getItem('foodspin-token');
      if (!token) {
        // Show default recommendations if no token
        setDefaultRecommendations();
        return;
      }

      const [historyResponse, favoritesResponse] = await Promise.allSettled([
        fetch('http://localhost:5001/api/wheel/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5001/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const historyData = historyResponse.status === 'fulfilled' && historyResponse.value.ok
        ? await historyResponse.value.json()
        : { history: [] };

      const favoritesData = favoritesResponse.status === 'fulfilled' && favoritesResponse.value.ok
        ? await favoritesResponse.value.json()
        : { favorites: [] };

      // Generate intelligent recommendations based on user data
      const intelligentRecommendations = generateIntelligentRecommendations(
        historyData.history || [],
        favoritesData.favorites || []
      );

      setRecommendedFoods(intelligentRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setDefaultRecommendations();
    }
  }, [generateIntelligentRecommendations, setDefaultRecommendations]);

  // ✅ COMPLETELY FIXED: Add dish to wheel function (NOW showSuccessMessage is defined above)
  const addToWheel = useCallback(async (dishName) => {
    if (addingDish === dishName || loading) return;
    
    setAddingDish(dishName);
    setLoading(true);

    try {
      const token = localStorage.getItem('foodspin-token');
      if (!token) {
        alert('Please log in to add dishes to the wheel');
        return;
      }

      // ✅ SIMPLIFIED APPROACH: Get current session from localStorage or use defaults
      const currentSessionId = localStorage.getItem('current-wheel-session');
      let currentDishes = [
        { name: 'Pizza', votes: 0 },
        { name: 'Burger', votes: 0 },
        { name: 'Sushi', votes: 0 },
        { name: 'Tacos', votes: 0 }
      ];

      // Try to get current session dishes if session exists
      if (currentSessionId) {
        try {
          const sessionResponse = await fetch(`http://localhost:5001/api/votes/session/${currentSessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            currentDishes = sessionData.dishes || currentDishes;
          }
        } catch (error) {
          console.log('Could not fetch current session, using defaults');
        }
      }

      // Check if dish already exists
      if (currentDishes.find(dish => dish.name.toLowerCase() === dishName.toLowerCase())) {
        alert(`${dishName} is already in the wheel!`);
        return;
      }

      // Check maximum dishes limit
      if (currentDishes.length >= 12) {
        alert('Maximum 12 dishes allowed on the wheel!');
        return;
      }

      // ✅ Create new session with the added dish
      const updatedDishes = [...currentDishes, { name: dishName, votes: 0 }];
      
      const response = await fetch('http://localhost:5001/api/votes/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dishes: updatedDishes.map(d => d.name)
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // ✅ Store session info for the wheel component
        localStorage.setItem('current-wheel-session', data.sessionId);
        
        // Show success message
        showSuccessMessage(dishName);
        
        // ✅ Trigger wheel component update
        window.dispatchEvent(new CustomEvent('dishAdded', { 
          detail: { 
            dishName, 
            sessionId: data.sessionId,
            dishes: data.dishes 
          } 
        }));
        
        // Also trigger wheel updated event
        window.dispatchEvent(new CustomEvent('wheelUpdated', { 
          detail: { 
            dishes: data.dishes, 
            sessionId: data.sessionId 
          } 
        }));
        
        // Refresh recommendations after a short delay
        setTimeout(() => {
          fetchRecommendedFoods();
        }, 1000);
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add dish to wheel');
      }
    } catch (error) {
      console.error('Error adding dish to wheel:', error);
      
      // ✅ More specific error messages
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('duplicate')) {
        alert(`${dishName} is already in the wheel!`);
      } else if (errorMessage.includes('limit') || errorMessage.includes('maximum')) {
        alert('You\'ve reached the maximum number of dishes (12) on the wheel!');
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        alert('Please log in to add dishes to the wheel');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert(`Failed to add ${dishName} to wheel. Please try again.`);
      }
    } finally {
      setLoading(false);
      setAddingDish(null);
    }
  }, [addingDish, loading, fetchRecommendedFoods, showSuccessMessage]);

  // ✅ Initialize data on component mount
  useEffect(() => {
    setCuisines([
      { id: 1, name: 'Italian', icon: '🍝', popular: 'Pizza, Pasta, Risotto' },
      { id: 2, name: 'Japanese', icon: '🍣', popular: 'Sushi, Ramen, Tempura' },
      { id: 3, name: 'Mexican', icon: '🌮', popular: 'Tacos, Burritos, Quesadillas' },
      { id: 4, name: 'Indian', icon: '🍛', popular: 'Curry, Biryani, Naan' },
      { id: 5, name: 'Chinese', icon: '🥟', popular: 'Dumplings, Fried Rice, Noodles' },
      { id: 6, name: 'American', icon: '🍔', popular: 'Burgers, BBQ, Wings' },
      { id: 7, name: 'Thai', icon: '🍜', popular: 'Pad Thai, Tom Yum, Green Curry' },
      { id: 8, name: 'Mediterranean', icon: '🥙', popular: 'Hummus, Falafel, Gyros' }
    ]);

    // Fetch intelligent recommendations
    fetchRecommendedFoods();
  }, [fetchRecommendedFoods]);

  return (
    <div className="space-y-12">
      
      {/* Cuisines Section */}
      <div>
        <h2 className="text-4xl font-black text-white mb-8 text-center bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
          🌍 Popular Cuisines
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cuisines.map((cuisine) => (
            <div 
              key={cuisine.id} 
              className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 cursor-pointer group"
            >
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {cuisine.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cuisine.name}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{cuisine.popular}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Recommended Foods Section */}
      <div>
        <h2 className="text-4xl font-black text-white mb-8 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          ⭐ Recommended for You
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedFoods.map((food) => (
            <div 
              key={food.id} 
              className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 group"
            >
              
              <div className="text-center mb-4">
                <div className="relative">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {food.image}
                  </div>
                  
                  {/* Winner Badge */}
                  {food.isWinner && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-bold px-2 py-1 rounded-full text-black shadow-lg">
                      🏆 Winner
                    </div>
                  )}
                  
                  {/* Favorite Badge */}
                  {food.isFavorite && (
                    <div className="absolute -top-2 -left-2 bg-gradient-to-r from-pink-400 to-red-500 text-xs font-bold px-2 py-1 rounded-full text-white shadow-lg">
                      ❤️ Fav
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{food.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{food.cuisine} Cuisine</p>
                
                {/* Vote count if available */}
                {food.votes > 0 && (
                  <p className="text-xs text-yellow-400 font-medium">
                    🗳️ {food.votes} votes in previous spins
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400 text-lg">⭐</span>
                  <span className="text-white font-semibold">{food.rating}</span>
                </div>
                
                <button 
                  onClick={() => addToWheel(food.name)}
                  disabled={addingDish === food.name || loading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/20 min-w-[120px]"
                >
                  {addingDish === food.name ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    '+ Add to Wheel'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchRecommendedFoods}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 shadow-xl border border-white/20"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              '🔄 Refresh Recommendations'
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-400 mt-4">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
              <span>Loading recommendations...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuisineSection;
