// backend/routes/foods.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Sample food data (later you can replace with a Food model)
const sampleFoods = [
  {
    id: 1,
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.5,
    priceRange: "$$",
    image: "🍕",
    description: "Authentic Italian pizza with fresh ingredients",
    location: "Downtown",
    isActive: true
  },
  {
    id: 2,
    name: "Burger Joint",
    cuisine: "American",
    rating: 4.2,
    priceRange: "$",
    image: "🍔",
    description: "Juicy burgers with homemade buns",
    location: "Food Court",
    isActive: true
  },
  {
    id: 3,
    name: "Sushi House",
    cuisine: "Japanese",
    rating: 4.8,
    priceRange: "$$$",
    image: "🍣",
    description: "Fresh sushi and sashimi daily",
    location: "Midtown",
    isActive: true
  },
  {
    id: 4,
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.3,
    priceRange: "$",
    image: "🌮",
    description: "Authentic Mexican tacos and burritos",
    location: "Street Food",
    isActive: true
  },
  {
    id: 5,
    name: "Curry Corner",
    cuisine: "Indian",
    rating: 4.6,
    priceRange: "$$",
    image: "🍛",
    description: "Spicy and flavorful Indian curries",
    location: "Little India",
    isActive: true
  },
  {
    id: 6,
    name: "Pasta Paradise",
    cuisine: "Italian",
    rating: 4.4,
    priceRange: "$$",
    image: "🍝",
    description: "Handmade pasta with traditional sauces",
    location: "Downtown",
    isActive: true
  },
  {
    id: 7,
    name: "BBQ Barn",
    cuisine: "American",
    rating: 4.7,
    priceRange: "$$$",
    image: "🍖",
    description: "Slow-cooked BBQ with smoky flavors",
    location: "Suburbs",
    isActive: true
  },
  {
    id: 8,
    name: "Dim Sum Delight",
    cuisine: "Chinese",
    rating: 4.5,
    priceRange: "$$",
    image: "🥟",
    description: "Traditional dim sum and Chinese delicacies",
    location: "Chinatown",
    isActive: true
  }
];

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Get all foods/restaurants (public route for demo, can be protected later)
router.get('/', async (req, res) => {
  try {
    const { cuisine, priceRange, search } = req.query;
    
    let filteredFoods = [...sampleFoods];

    // Filter by cuisine
    if (cuisine && cuisine !== 'all') {
      filteredFoods = filteredFoods.filter(food => 
        food.cuisine.toLowerCase() === cuisine.toLowerCase()
      );
    }

    // Filter by price range
    if (priceRange && priceRange !== 'all') {
      filteredFoods = filteredFoods.filter(food => 
        food.priceRange === priceRange
      );
    }

    // Search by name
    if (search) {
      filteredFoods = filteredFoods.filter(food =>
        food.name.toLowerCase().includes(search.toLowerCase()) ||
        food.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Only return active foods
    filteredFoods = filteredFoods.filter(food => food.isActive);

    res.json({
      success: true,
      count: filteredFoods.length,
      foods: filteredFoods
    });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single food by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const food = sampleFoods.find(f => f.id === parseInt(id));
    
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({
      success: true,
      food
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get random food for spinning (protected route)
router.get('/spin/random', verifyToken, async (req, res) => {
  try {
    const { preferences } = req.query;
    
    let availableFoods = sampleFoods.filter(food => food.isActive);

    // Apply user preferences if provided
    if (preferences) {
      const prefs = JSON.parse(preferences);
      
      if (prefs.cuisines && prefs.cuisines.length > 0) {
        availableFoods = availableFoods.filter(food =>
          prefs.cuisines.some(cuisine => 
            cuisine.toLowerCase() === food.cuisine.toLowerCase()
          )
        );
      }

      if (prefs.budget) {
        const budgetMap = {
          'low': '$',
          'medium': '$$',
          'high': '$$$'
        };
        availableFoods = availableFoods.filter(food =>
          food.priceRange === budgetMap[prefs.budget]
        );
      }
    }

    if (availableFoods.length === 0) {
      return res.status(404).json({ 
        message: 'No foods match your preferences. Try adjusting your filters!' 
      });
    }

    // Select random food
    const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];

    res.json({
      success: true,
      message: '🎉 Spin complete!',
      result: randomFood,
      totalOptions: availableFoods.length
    });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get cuisine types
router.get('/meta/cuisines', async (req, res) => {
  try {
    const cuisines = [...new Set(sampleFoods.map(food => food.cuisine))];
    res.json({
      success: true,
      cuisines: cuisines.sort()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get price ranges
router.get('/meta/prices', async (req, res) => {
  try {
    const priceRanges = [...new Set(sampleFoods.map(food => food.priceRange))];
    res.json({
      success: true,
      priceRanges: priceRanges.sort()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
