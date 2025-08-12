const mongoose = require('mongoose');

const userFavoritesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dishName: {
    type: String,
    required: true,
    trim: true
  },
  cuisineType: {
    type: String,
    trim: true
  },
  description: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$']
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  fromWheelResult: {
    type: Boolean,
    default: false
  },
  wheelHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WheelHistory'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate favorites per user
userFavoritesSchema.index({ userId: 1, dishName: 1 }, { unique: true });

module.exports = mongoose.model('UserFavorites', userFavoritesSchema);

