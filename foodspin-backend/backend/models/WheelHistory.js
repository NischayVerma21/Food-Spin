// backend/models/WheelHistory.js
const mongoose = require('mongoose');

const wheelHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dishes: [{
    name: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 1
    },
    weight: {
      type: Number,
      default: 1
    },
    color: String,
    cuisineType: String,
    fromRecommendation: {
      type: Boolean,
      default: false
    }
  }],
  winner: {
    name: {
      type: String,
      required: true
    },
    totalVotes: {
      type: Number,
      default: 1
    },
    weight: {
      type: Number,
      default: 1
    },
    sectorIndex: Number,
    cuisineType: String
  },
  spinDuration: {
    type: Number,
    default: 3000
  },
  spunAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet'],
      default: 'desktop'
    },
    markedAsFavorite: {
      type: Boolean,
      default: false
    },
    restaurantSearched: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    totalSpinTime: Number,
    repeatSpin: {
      type: Boolean,
      default: false
    },
    previousWinner: String
  },
  // ✅ TTL FIELD: Expire after 5 days (432000 seconds)
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 432000 // 5 * 24 * 60 * 60 = 432000 seconds
  }
}, {
  timestamps: true,
  minimize: false
});

// Indexes
wheelHistorySchema.index({ userId: 1, spunAt: -1 });
wheelHistorySchema.index({ userId: 1, 'winner.cuisineType': 1 });
wheelHistorySchema.index({ userId: 1, 'metadata.markedAsFavorite': 1 });
wheelHistorySchema.index({ 'winner.name': 'text' });

// ✅ TTL INDEX: Using spunAt field for 5-day expiration
wheelHistorySchema.index({ spunAt: 1 }, { expireAfterSeconds: 432000 }); // 5 days

// Instance methods
wheelHistorySchema.methods.getWinnerCuisine = function() {
  return this.winner.cuisineType || 'Unknown';
};

wheelHistorySchema.methods.wasMarkedAsFavorite = function() {
  return this.metadata?.markedAsFavorite || false;
};

// Static methods
wheelHistorySchema.statics.getUserCuisinePreferences = async function(userId) {
  return await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { 
      _id: '$winner.cuisineType', 
      count: { $sum: 1 },
      lastSpun: { $max: '$spunAt' }
    }},
    { $sort: { count: -1 } }
  ]);
};

wheelHistorySchema.statics.getPopularDishes = async function(userId, limit = 10) {
  return await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { 
      _id: '$winner.name', 
      count: { $sum: 1 },
      cuisineType: { $first: '$winner.cuisineType' }
    }},
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('WheelHistory', wheelHistorySchema);
