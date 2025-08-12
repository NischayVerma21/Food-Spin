// backend/routes/favorites.js
const express = require('express');
const router = express.Router();
const UserFavorites = require('../models/UserFavorites');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Add dish to favorites
router.post('/', auth, async (req, res) => {
  console.log('❤️ Add to favorites POST endpoint hit');
  console.log('User ID:', req.user.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      dishName, 
      cuisineType, 
      description, 
      rating, 
      priceRange, 
      fromWheelResult, 
      wheelHistoryId 
    } = req.body;
    
    if (!dishName || dishName.trim() === '') {
      console.log('❌ Invalid dish name');
      return res.status(400).json({ message: 'Dish name is required' });
    }
    
    const favorite = new UserFavorites({
      userId: req.user.id,
      dishName: dishName.trim(),
      cuisineType,
      description,
      rating,
      priceRange,
      fromWheelResult: fromWheelResult || false,
      wheelHistoryId
    });
    
    console.log('💾 Attempting to save favorite:', JSON.stringify(favorite, null, 2));
    
    const savedFavorite = await favorite.save();
    
    console.log('✅ Successfully saved favorite with ID:', savedFavorite._id);
    
    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalFavorites': 1 }
    });
    
    res.status(201).json({ 
      message: 'Added to favorites successfully', 
      favorite: savedFavorite 
    });
  } catch (error) {
    if (error.code === 11000) {
      console.log('❌ Duplicate favorite');
      res.status(400).json({ message: 'Dish already in favorites' });
    } else {
      console.error('❌ Add favorite error:', error);
      res.status(500).json({ message: 'Failed to add to favorites', error: error.message });
    }
  }
});

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    console.log('❤️ Fetching favorites for user:', req.user.id);
    
    const { cuisineType, fromWheel, sortBy = 'addedAt', order = 'desc' } = req.query;
    
    let filter = { userId: req.user.id, isActive: true };
    
    if (cuisineType) {
      filter.cuisineType = new RegExp(cuisineType, 'i');
    }
    
    if (fromWheel !== undefined) {
      filter.fromWheelResult = fromWheel === 'true';
    }
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };
    
    const favorites = await UserFavorites.find(filter)
      .sort(sortOptions)
      .populate('wheelHistoryId', 'spunAt winner')
      .select('-__v');
    
    console.log(`✅ Found ${favorites.length} favorites`);
    
    res.json({ favorites });
  } catch (error) {
    console.error('❌ Fetch favorites error:', error);
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
});

// Remove from favorites
router.delete('/:favoriteId', auth, async (req, res) => {
  try {
    const deleted = await UserFavorites.findOneAndDelete({
      _id: req.params.favoriteId,
      userId: req.user.id
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalFavorites': -1 }
    });
    
    console.log('✅ Favorite deleted:', req.params.favoriteId);
    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    res.status(500).json({ message: 'Failed to remove favorite', error: error.message });
  }
});

module.exports = router;
