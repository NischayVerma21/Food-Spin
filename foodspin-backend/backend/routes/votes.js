// backend/routes/votes.js
const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const auth = require('../middleware/auth');

// Create new voting session
router.post('/session', auth, async (req, res) => {
  try {
    const { dishes } = req.body;
    
    if (!dishes || !Array.isArray(dishes) || dishes.length < 2) {
      return res.status(400).json({ message: 'At least 2 dishes required' });
    }

    const voteSession = new Vote({
      userId: req.user.id,
      dishes: dishes.map(dish => ({
        name: dish,
        votes: 0
      }))
    });

    await voteSession.save();
    
    res.status(201).json({
      message: 'Voting session created',
      sessionId: voteSession.sessionId,
      dishes: voteSession.dishes
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Failed to create voting session' });
  }
});

// Add vote to dish (atomic operation)
router.post('/add/:sessionId/:dishName', auth, async (req, res) => {
  try {
    const { sessionId, dishName } = req.params;
    
    // Use atomic update to prevent race conditions
    const result = await Vote.findOneAndUpdate(
      { 
        userId: req.user.id, 
        sessionId: sessionId,
        'dishes.name': dishName,
        isActive: true 
      },
      { 
        $inc: { 
          'dishes.$.votes': 1,
          'totalVotes': 1
        },
        $set: {
          'dishes.$.lastVotedAt': new Date()
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!result) {
      return res.status(404).json({ message: 'Voting session or dish not found' });
    }

    // Return only the updated dish and totals
    const updatedDish = result.dishes.find(d => d.name === dishName);
    
    res.json({
      success: true,
      dishName: dishName,
      newVoteCount: updatedDish.votes,
      totalVotes: result.totalVotes,
      dishes: result.dishes
    });
  } catch (error) {
    console.error('Add vote error:', error);
    res.status(500).json({ message: 'Failed to add vote' });
  }
});

// Remove vote from dish
router.post('/remove/:sessionId/:dishName', auth, async (req, res) => {
  try {
    const { sessionId, dishName } = req.params;
    
    const result = await Vote.findOneAndUpdate(
      { 
        userId: req.user.id, 
        sessionId: sessionId,
        'dishes.name': dishName,
        'dishes.votes': { $gt: 0 }, // Only if votes > 0
        isActive: true 
      },
      { 
        $inc: { 
          'dishes.$.votes': -1,
          'totalVotes': -1
        },
        $set: {
          'dishes.$.lastVotedAt': new Date()
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Cannot remove vote - dish has 0 votes or not found' });
    }

    const updatedDish = result.dishes.find(d => d.name === dishName);
    
    res.json({
      success: true,
      dishName: dishName,
      newVoteCount: updatedDish.votes,
      totalVotes: result.totalVotes,
      dishes: result.dishes
    });
  } catch (error) {
    console.error('Remove vote error:', error);
    res.status(500).json({ message: 'Failed to remove vote' });
  }
});

// Get current voting data
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const voteSession = await Vote.findOne({
      userId: req.user.id,
      sessionId: sessionId,
      isActive: true
    });

    if (!voteSession) {
      return res.status(404).json({ message: 'Voting session not found' });
    }

    res.json({
      sessionId: voteSession.sessionId,
      dishes: voteSession.dishes,
      totalVotes: voteSession.totalVotes,
      createdAt: voteSession.createdAt
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Failed to get voting session' });
  }
});

module.exports = router;
