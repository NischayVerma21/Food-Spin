// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader); // Debug log
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No Authorization header provided.' });
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Extracted Token:', token.substring(0, 20) + '...'); // Debug log (partial)
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'Access denied. No valid token provided.' });
    }
    
    // Validate JWT format
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid JWT format. Parts:', tokenParts.length);
      return res.status(401).json({ message: 'Token format is invalid.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid - user not found.' });
    }
    
    req.user = { id: user._id, email: user.email, name: user.name };
    console.log('Authenticated user:', req.user.email); // Debug log
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is malformed or invalid.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    } else {
      return res.status(401).json({ message: 'Token verification failed.' });
    }
  }
};

module.exports = auth;
