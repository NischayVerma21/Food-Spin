// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // ✅ Initialize app FIRST

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodspin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB - foodspin database'))
.catch((error) => console.error('❌ MongoDB connection error:', error));

// Routes - ✅ Add votes route AFTER app initialization
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/foods', require('./routes/foods.js'));
app.use('/api/wheel', require('./routes/wheel.js'));
app.use('/api/favorites', require('./routes/favorites.js'));
app.use('/api/votes', require('./routes/votes.js')); // ✅ Moved here

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'FoodSpin Backend is running! 🍕',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth (signup, login, verify, change-password)',
      foods: '/api/foods (get foods, spin)',
      wheel: '/api/wheel (history operations)',
      favorites: '/api/favorites (CRUD operations)',
      votes: '/api/votes (voting operations)', // ✅ Added to endpoints list
      test: '/api/test (this endpoint)'
    }
  });
  console.log('Test route hit');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler - EXPRESS V5 COMPATIBLE
app.use('/*path', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.params.path,
    availableRoutes: [
      '/api/auth',
      '/api/foods', 
      '/api/wheel',
      '/api/favorites',
      '/api/votes', // ✅ Added to available routes
      '/api/test'
    ]
  });
});
// ✅ FIXED: MongoDB-compatible cleanup function
const cleanupVoteData = async () => {
  try {
    console.log('🧹 Starting vote data cleanup (keeping only today\'s latest votes)...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Import your models (you'll need to adjust these based on your actual models)
    const VotingSession = require('./models/VotingSession');
    const VoteRecord = require('./models/VoteRecord'); 
    const WheelHistory = require('./models/WheelHistory');

    // Step 1: Clean up old voting sessions (older than 1 day)
    const sessionCleanup = await VotingSession.deleteMany({
      status: 'completed',
      updatedAt: { $lt: oneDayAgo }
    });

    // Step 2: Remove all votes from previous days (keep only today's votes)
    const oldVotesCleanup = await VoteRecord.deleteMany({
      createdAt: { $lt: today }
    });

    // Step 3: For today's votes, keep only the latest per user per dish per session
    const todayVotes = await VoteRecord.find({
      createdAt: { $gte: today }
    }).sort({ createdAt: -1 });

    // Group by user, session, and dish to find duplicates
    const latestVotes = new Map();
    const votesToDelete = [];

    todayVotes.forEach(vote => {
      const key = `${vote.userId}-${vote.sessionId}-${vote.dishName}`;
      if (latestVotes.has(key)) {
        // This is an older vote for the same user/session/dish
        votesToDelete.push(vote._id);
      } else {
        // This is the latest vote for this combination
        latestVotes.set(key, vote);
      }
    });

    const duplicateVotesCleanup = await VoteRecord.deleteMany({
      _id: { $in: votesToDelete }
    });

    // Step 4: Clean up old wheel history (older than 30 days)
    const historyCleanup = await WheelHistory.deleteMany({
      spunAt: { $lt: thirtyDaysAgo }
    });

    console.log(`✅ Cleanup completed:
      - Voting sessions: ${sessionCleanup.deletedCount} removed
      - Duplicate votes (today): ${duplicateVotesCleanup.deletedCount} removed
      - Old votes (previous days): ${oldVotesCleanup.deletedCount} removed
      - History records: ${historyCleanup.deletedCount} removed`);
      
  } catch (error) {
    console.error('❌ Vote data cleanup failed:', error);
  }
};

cleanupVoteData().then(() => {
  console.log('✅ Initial cleanup completed');
  
  // ✅ Now schedule for every 6 hours
  const cleanupInterval = setInterval(() => {
    console.log('⏰ Running 6-hour scheduled cleanup...');
    cleanupVoteData();
  }, 6 * 60 * 60 * 1000);
  
  console.log('📅 Cleanup scheduled every 6 hours starting now');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 FoodSpin Backend running on port ${PORT}`);
  console.log(`📡 Server accessible at http://localhost:${PORT}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});
