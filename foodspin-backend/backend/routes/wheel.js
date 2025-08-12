// backend/routes/wheel.js
const express = require('express'); // ← ADD THIS LINE
const router = express.Router();    // ← ADD THIS LINE
const WheelHistory = require('../models/WheelHistory');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Save wheel spin result to history
router.post('/history', auth, async (req, res) => {
  console.log('🎰 Wheel history POST endpoint hit');
  console.log('User ID:', req.user.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { dishes, winner, spinDuration } = req.body;
    
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      console.log('❌ Invalid dishes data');
      return res.status(400).json({ message: 'Dishes array is required' });
    }
    
    if (!winner || !winner.name) {
      console.log('❌ Invalid winner data');
      return res.status(400).json({ message: 'Winner information is required' });
    }
    
    const historyEntry = new WheelHistory({
      userId: req.user.id,
      dishes: dishes.map(dish => ({
        name: dish.name,
        votes: dish.votes || 1,
        weight: dish.weight || 1,
        color: dish.color,
        cuisineType: dish.cuisineType
      })),
      winner: {
        name: winner.name,
        totalVotes: winner.totalVotes || winner.votes || 1,
        weight: winner.weight || 1,
        sectorIndex: winner.sectorIndex,
        cuisineType: winner.cuisineType
      },
      spinDuration: spinDuration || 3000,
      metadata: {
        deviceType: 'desktop',
        markedAsFavorite: false,
        restaurantSearched: false
      },
      analytics: {
        repeatSpin: false
      }
    });
    
    console.log('💾 Attempting to save:', JSON.stringify(historyEntry, null, 2));
    
    const savedEntry = await historyEntry.save();
    
    console.log('✅ Successfully saved to DB with ID:', savedEntry._id);
    
    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalSpins': 1 },
      $set: { 'stats.lastSpinAt': new Date() }
    });
    
    res.status(201).json({ 
      message: 'History saved successfully', 
      historyEntry: savedEntry 
    });
  } catch (error) {
    console.error('❌ Save history error:', error);
    res.status(500).json({ 
      message: 'Failed to save history', 
      error: error.message 
    });
  }
});

// Get user's wheel history
router.get('/history', auth, async (req, res) => {
  try {
    console.log('📜 Fetching history for user:', req.user.id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const history = await WheelHistory.find({ userId: req.user.id })
      .sort({ spunAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    const total = await WheelHistory.countDocuments({ userId: req.user.id });
    
    console.log(`✅ Found ${history.length} history entries out of ${total} total`);
    
    res.json({ 
      history,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Fetch history error:', error);
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
});

module.exports = router; // ← MAKE SURE THIS LINE EXISTS
