// backend/models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  dishes: [{
    name: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    },
    lastVotedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ✅ ADD TTL FIELD: Expire after 24 hours (86400 seconds)
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
voteSchema.index({ userId: 1, sessionId: 1 });
voteSchema.index({ 'dishes.name': 1 });

// ✅ ADD TTL INDEX: Alternative method using createdAt field
voteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Vote', voteSchema);
