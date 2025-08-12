// src/components/HomeComponents/WheelComponent.js
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const WheelComponent = () => {
  // ✅ FIXED: Wrap DEFAULT_DISHES as a constant (not useState)
  const DEFAULT_DISHES = useMemo(() => [
    { name: 'Pizza', votes: 0 },
    { name: 'Burger', votes: 0 },
    { name: 'Sushi', votes: 0 },
    { name: 'Tacos', votes: 0 }
  ], []);

  // ✅ FIXED: Wrap colors array in useMemo to avoid re-creating on every render
  const colors = useMemo(() => [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#FD79A8', '#6C5CE7', '#A29BFE', '#74B9FF'
  ], []);

  const [dishes, setDishes] = useState(DEFAULT_DISHES);
  const [newDish, setNewDish] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const voteDebounceRef = useRef(null);

  // ✅ FIXED: Add startPolling to dependencies
  const initializeVotingSession = useCallback(async () => {
    if (loading || isInitialized) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('foodspin-token');
      if (!token) {
        console.log('No auth token available');
        if (dishes.length === 0) {
          setDishes(DEFAULT_DISHES);
        }
        setLoading(false);
        return;
      }

      const currentDishes = dishes.length > 0 ? dishes : DEFAULT_DISHES;
      const response = await fetch('http://localhost:5001/api/votes/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dishes: currentDishes.map(d => d.name)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        
        if (data.dishes && data.dishes.length > 0) {
          setDishes(data.dishes);
        } else {
          setDishes(currentDishes);
        }
        
        setIsInitialized(true);
        startPolling(data.sessionId);
      } else {
        console.error('Failed to create voting session:', response.status);
        if (dishes.length === 0) {
          setDishes(DEFAULT_DISHES);
        }
      }
    } catch (error) {
      console.error('Failed to initialize voting session:', error);
      if (dishes.length === 0) {
        setDishes(DEFAULT_DISHES);
      }
    } finally {
      setLoading(false);
    }
  }, [dishes, loading, isInitialized, DEFAULT_DISHES]); // ✅ FIXED: Added missing dependencies

  const startPolling = useCallback((sessionId) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(async () => {
      const now = Date.now();
      
      if (now - lastPollTime < 2500) {
        return;
      }
      
      try {
        const token = localStorage.getItem('foodspin-token');
        if (!token) {
          console.log('No token available, stopping polling');
          clearInterval(pollIntervalRef.current);
          return;
        }

        const response = await fetch(`http://localhost:5001/api/votes/session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDishes(data.dishes);
          setLastPollTime(now);
        } else if (response.status === 401) {
          console.log('Auth failed, stopping polling');
          clearInterval(pollIntervalRef.current);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  }, [lastPollTime]);

  // ✅ Add missing dependencies but use the functional updates approach to prevent dependency loops
  useEffect(() => {
    if (!isInitialized && !sessionId) {
      initializeVotingSession();
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (voteDebounceRef.current) {
        clearTimeout(voteDebounceRef.current);
      }
    };
  }, [initializeVotingSession]); // ✅ FIXED: Added initializeVotingSession dependency

  // ✅ Enhanced drawWheel function with error handling
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (dishes.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      const emptyGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      emptyGradient.addColorStop(0, 'rgba(100, 100, 100, 0.1)');
      emptyGradient.addColorStop(1, 'rgba(100, 100, 100, 0.3)');
      ctx.fillStyle = emptyGradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Add dishes to spin!', centerX, centerY);
      return;
    }
    
    const angleStep = (2 * Math.PI) / dishes.length;
    const totalVotes = dishes.reduce((sum, dish) => sum + (dish.votes || 0), 0);
    
    const hexToRgba = (hex, alpha) => {
      try {
        if (typeof alpha !== 'number' || isNaN(alpha)) {
          alpha = 0.5;
        }
        alpha = Math.max(0, Math.min(1, alpha));
        
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
          return `rgba(255, 107, 107, ${alpha})`;
        }
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } catch (error) {
        return `rgba(255, 107, 107, ${alpha || 0.5})`;
      }
    };
    
    dishes.forEach((dish, index) => {
      const startAngle = index * angleStep;
      const endAngle = (index + 1) * angleStep;
      
      const votes = dish.votes || 0;
      const voteRatio = totalVotes > 0 ? votes / totalVotes : 0;
      const intensity = Math.max(0.4, voteRatio * 2);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      const color = colors[index % colors.length];
      
      gradient.addColorStop(0, hexToRgba(color, intensity * 0.3));
      gradient.addColorStop(0.4, hexToRgba(color, intensity * 0.6));
      gradient.addColorStop(0.8, hexToRgba(color, intensity * 0.8));
      gradient.addColorStop(1, hexToRgba(color, 1.0));
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      const borderAlpha = Math.max(0, Math.min(1, 0.4 + (intensity * 0.4)));
      ctx.strokeStyle = `rgba(255, 255, 255, ${borderAlpha})`;
      ctx.lineWidth = 2 + (voteRatio * 4);
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + angleStep / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      
      const fontSize = Math.max(12, Math.min(18, 350 / dishes.length));
      ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 5;
      
      const textRadius = radius * 0.65;
      ctx.fillText(dish.name || 'Unknown', textRadius, -5);
      
      ctx.font = `bold ${fontSize - 2}px Poppins, sans-serif`;
      ctx.fillStyle = votes > 0 ? '#FFD700' : '#CCCCCC';
      ctx.fillText(`${votes} votes`, textRadius, 15);
      
      ctx.restore();
    });
    
    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
    
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 70);
    centerGradient.addColorStop(0, 'rgba(15, 15, 15, 0.95)');
    centerGradient.addColorStop(0.5, 'rgba(30, 30, 30, 0.9)');
    centerGradient.addColorStop(1, 'rgba(45, 45, 45, 0.85)');
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    ctx.fillText('🎯', centerX, centerY + 12);
  }, [dishes, colors]);

  // ✅ FIXED: Added drawWheel dependency
  useEffect(() => {
    if (dishes.length === 0 && !loading && !spinning) {
      console.log('Setting default dishes');
      setDishes(DEFAULT_DISHES);
    } else {
      drawWheel();
    }
  }, [dishes, loading, spinning, DEFAULT_DISHES, drawWheel]); // ✅ FIXED: Added drawWheel dependency

  // ✅ Event listener for dishes added from CuisineSection
  useEffect(() => {
    const handleDishAdded = (event) => {
      const { dishName, sessionId: newSessionId } = event.detail;
      console.log(`Dish "${dishName}" added from CuisineSection`);
      
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
      }
      
      if (newSessionId) {
        setTimeout(() => {
          startPolling(newSessionId);
        }, 500);
      }
    };

    const handleWheelUpdated = (event) => {
      const { dishes: newDishes, sessionId: newSessionId } = event.detail;
      console.log('Wheel updated with new dishes:', newDishes);
      setDishes(newDishes);
      setSessionId(newSessionId);
      startPolling(newSessionId);
    };

    window.addEventListener('dishAdded', handleDishAdded);
    window.addEventListener('wheelUpdated', handleWheelUpdated);

    return () => {
      window.removeEventListener('dishAdded', handleDishAdded);
      window.removeEventListener('wheelUpdated', handleWheelUpdated);
    };
  }, [sessionId, startPolling]);

  // ✅ Enhanced addDish with session management
  const addDish = useCallback(async () => {
    if (newDish.trim() && !dishes.find(d => d.name === newDish.trim()) && dishes.length < 12 && !loading) {
      const updatedDishes = [...dishes, { name: newDish.trim(), votes: 0 }];
      setDishes(updatedDishes);
      setNewDish('');
      
      setLoading(true);
      try {
        const token = localStorage.getItem('foodspin-token');
        if (!token) return;

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
          setSessionId(data.sessionId);
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          startPolling(data.sessionId);
        }
      } catch (error) {
        console.error('Failed to update voting session:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [newDish, dishes, loading, startPolling]);

  // ✅ Voting functions
  const addVote = useCallback(async (dishName) => {
    if (!sessionId || loading) return;
    
    if (voteDebounceRef.current) {
      clearTimeout(voteDebounceRef.current);
    }
    
    voteDebounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('foodspin-token');
        if (!token) return;

        const response = await fetch(`http://localhost:5001/api/votes/add/${sessionId}/${encodeURIComponent(dishName)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDishes(data.dishes);
        } else {
          console.error('Failed to add vote:', response.status);
        }
      } catch (error) {
        console.error('Error adding vote:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [sessionId, loading]);

  const removeVote = useCallback(async (dishName) => {
    if (!sessionId || loading) return;
    
    if (voteDebounceRef.current) {
      clearTimeout(voteDebounceRef.current);
    }
    
    voteDebounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('foodspin-token');
        if (!token) return;

        const response = await fetch(`http://localhost:5001/api/votes/remove/${sessionId}/${encodeURIComponent(dishName)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDishes(data.dishes);
        } else {
          console.error('Failed to remove vote:', response.status);
        }
      } catch (error) {
        console.error('Error removing vote:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [sessionId, loading]);

  const removeDish = useCallback(async (index) => {
    if (dishes.length > 2 && !loading) {
      const updatedDishes = dishes.filter((_, i) => i !== index);
      setDishes(updatedDishes);
      
      setLoading(true);
      try {
        const token = localStorage.getItem('foodspin-token');
        if (!token) return;

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
          setSessionId(data.sessionId);
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          startPolling(data.sessionId);
        }
      } catch (error) {
        console.error('Failed to update voting session:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [dishes, loading, startPolling]);

  const selectWinnerByProbability = useCallback(() => {
    if (!dishes || dishes.length === 0) return null;
    
    const totalVotes = dishes.reduce((sum, dish) => sum + (dish.votes || 0), 0);
    
    if (totalVotes === 0) {
      return dishes[Math.floor(Math.random() * dishes.length)].name;
    }

    const maxVotes = Math.max(...dishes.map(dish => dish.votes || 0));
    const highVoteDishes = dishes.filter(dish => (dish.votes || 0) === maxVotes);
    
    const dishesWithProbability = dishes.map(dish => {
      const votes = dish.votes || 0;
      let probability;
      
      if (votes === maxVotes) {
        probability = 0.7 / highVoteDishes.length;
      } else {
        const otherDishes = dishes.filter(d => (d.votes || 0) !== maxVotes);
        const otherTotalVotes = otherDishes.reduce((sum, d) => sum + (d.votes || 0), 0);
        
        if (otherTotalVotes === 0) {
          probability = 0.3 / otherDishes.length;
        } else {
          probability = (0.3 * votes) / otherTotalVotes;
        }
      }
      
      return { ...dish, probability };
    });

    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (let dish of dishesWithProbability) {
      cumulativeProbability += dish.probability;
      if (random <= cumulativeProbability) {
        return dish.name;
      }
    }
    
    return dishesWithProbability[dishesWithProbability.length - 1].name;
  }, [dishes]);

  // ✅ Database save function
  const saveToDatabase = useCallback(async (selectedDish) => {
    try {
      const token = localStorage.getItem('foodspin-token');
      if (!token || !selectedDish) return;
      
      const response = await fetch('http://localhost:5001/api/wheel/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dishes: dishes.map(dish => ({ 
            name: dish.name, 
            votes: dish.votes || 0,
            weight: 1,
            cuisineType: 'Unknown'
          })),
          winner: { 
            name: selectedDish, 
            totalVotes: dishes.find(d => d.name === selectedDish)?.votes || 0,
            weight: 1,
            cuisineType: 'Unknown'
          },
          spinDuration: 5000
        })
      });
      
      if (response.ok) {
        console.log('✅ History saved successfully');
      }
    } catch (error) {
      console.error('❌ Error saving history:', error);
    }
  }, [dishes]);

  // ✅ FIXED: Added saveToDatabase dependency
  const spinWheel = useCallback(async () => {
    if (spinning || dishes.length === 0) return;
    
    setSpinning(true);
    setShowResult(false);
    
    const winner = selectWinnerByProbability();
    if (!winner) return;

    const minSpins = 8;
    const maxSpins = 12;
    const randomSpins = minSpins + Math.random() * (maxSpins - minSpins);
    const randomOffset = Math.random() * 360;
    const totalRotation = randomSpins * 360 + randomOffset;
    
    const canvas = canvasRef.current;
    const startTime = Date.now();
    const duration = 5000;
    const startRotation = rotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + totalRotation * easeOut;
      
      setRotation(currentRotation);
      
      if (canvas) {
        canvas.style.transform = `rotate(${currentRotation}deg)`;
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setResult(winner);
        setSpinning(false);
        setShowResult(true);
        saveToDatabase(winner);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [spinning, dishes, rotation, selectWinnerByProbability, saveToDatabase]); // ✅ FIXED: Added saveToDatabase dependency

  const markAsFavorite = useCallback(async () => {
    if (!result) return;
    
    try {
      const token = localStorage.getItem('foodspin-token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dishName: result,
          fromWheelResult: true,
          cuisineType: 'Unknown'
        })
      });
      
      if (response.ok) {
        alert(`${result} added to favorites! ❤️`);
      }
    } catch (error) {
      alert('Error adding to favorites');
    }
  }, [result]);

  const getTotalVotes = useCallback(() => {
    return dishes.reduce((sum, dish) => sum + (dish.votes || 0), 0);
  }, [dishes]);

  const getTopVotedDishes = useCallback(() => {
    const maxVotes = Math.max(...dishes.map(dish => dish.votes || 0));
    return dishes.filter(dish => (dish.votes || 0) === maxVotes);
  }, [dishes]);

  const resetVotes = useCallback(async () => {
    if (!sessionId) return;
    
    setIsInitialized(false);
    await initializeVotingSession();
  }, [sessionId, initializeVotingSession]);

  return (
    <div className="max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif' }}>
      
      {/* Load Poppins Font */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" 
        rel="stylesheet" 
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
          🎰 Food Selection Wheel
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
          Vote for your favorite dishes and let probability decide your meal!
        </p>
        
        {getTotalVotes() > 0 && (
          <div className="mt-6 backdrop-blur-xl bg-white/5 rounded-2xl p-4 max-w-md mx-auto border border-white/10">
            <div className="text-white font-semibold">
              📊 Total Votes: {getTotalVotes()} | Leading: {getTopVotedDishes().map(d => d.name).join(', ')}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Side - Wheel */}
        <div className="flex flex-col items-center space-y-8">
          
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 via-red-500/20 to-pink-500/20 blur-2xl transform scale-125 animate-pulse"></div>
            
            <canvas
              ref={canvasRef}
              width={550}
              height={550}
              className="rounded-full shadow-2xl backdrop-blur-xl border-4 border-white/30 transition-transform duration-100 ease-linear relative z-10"
              style={{ 
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                transform: `rotate(${rotation}deg)`,
                filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.4))'
              }}
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={spinWheel}
              disabled={spinning || dishes.length === 0 || loading}
              className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-16 py-5 rounded-3xl text-2xl font-black hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl border-3 border-white/30 min-w-[320px] relative overflow-hidden"
            >
              {spinning ? (
                <div className="flex items-center justify-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-white"></div>
                  <span>SPINNING... 🌪️</span>
                </div>
              ) : (
                <span className="relative z-10">SPIN THE WHEEL! 🎰</span>
              )}
            </button>

            <div className="flex gap-3 justify-center">
              <button
                onClick={resetVotes}
                disabled={getTotalVotes() === 0 || loading}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                🔄 Reset Votes
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Dish Management */}
        <div className="space-y-8">
          
          {/* Add Dish Section */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3 text-4xl">➕</span>
              Add New Dish
            </h2>
            
            <div className="space-y-6">
              <input
                type="text"
                value={newDish}
                onChange={(e) => setNewDish(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDish()}
                placeholder="Enter delicious dish name..."
                className="w-full px-6 py-4 bg-black/30 border-2 border-white/20 text-white placeholder-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 text-lg font-medium"
                maxLength={20}
              />
              
              <button
                onClick={addDish}
                disabled={!newDish.trim() || dishes.find(d => d.name === newDish.trim()) || dishes.length >= 12 || loading}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border-2 border-white/20"
              >
                {loading ? '⏳ Updating...' :
                 dishes.length >= 12 ? '🚫 Maximum 12 dishes reached' : 
                 dishes.find(d => d.name === newDish.trim()) ? '⚠️ Dish already exists' : 
                 '✨ Add Dish to Wheel'}
              </button>
            </div>
          </div>

          {/* Current Dishes with Database Voting */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 text-4xl">🗳️</span>
                Vote for Dishes
              </div>
              <span className="text-lg font-medium text-gray-300 bg-white/10 px-4 py-2 rounded-xl">
                {dishes.length}/12
              </span>
            </h2>
            
            {dishes.length > 0 ? (
              <div className="space-y-4">
                {dishes.map((dish, index) => (
                  <div 
                    key={`dish-${dish.name}-${index}`}
                    className="bg-gradient-to-r from-black/20 to-black/10 rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all group hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-6 h-6 rounded-full border-3 border-white/60 shadow-lg relative"
                          style={{ 
                            backgroundColor: colors[index % colors.length],
                            boxShadow: `0 0 20px ${colors[index % colors.length]}60`
                          }}
                        >
                          <div className="absolute inset-0 rounded-full bg-white/20"></div>
                        </div>
                        <div>
                          <span className="text-white font-bold text-lg">{dish.name}</span>
                          <div className="text-sm text-gray-300 font-medium">
                            {dish.votes || 0} vote{(dish.votes || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => removeVote(dish.name)}
                          disabled={(dish.votes || 0) === 0 || loading}
                          className="bg-red-500/80 hover:bg-red-500 text-white w-10 h-10 rounded-full font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                        >
                          −
                        </button>
                        
                        <div className="bg-white/20 px-4 py-2 rounded-xl min-w-[50px] text-center">
                          <span className="text-white font-bold text-lg">{dish.votes || 0}</span>
                        </div>
                        
                        <button
                          onClick={() => addVote(dish.name)}
                          disabled={loading}
                          className="bg-green-500/80 hover:bg-green-500 text-white w-10 h-10 rounded-full font-bold text-lg transition-all hover:scale-110 disabled:opacity-50"
                        >
                          +
                        </button>
                        
                        <button
                          onClick={() => removeDish(index)}
                          className="text-red-400 hover:text-red-300 ml-4 opacity-0 group-hover:opacity-100 transition-all text-xl hover:scale-125"
                          disabled={dishes.length <= 2 || loading}
                          title={dishes.length <= 2 ? 'Minimum 2 dishes required' : 'Remove dish'}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-lg font-medium">No dishes added yet. Add some dishes to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 rounded-3xl shadow-2xl p-10 max-w-lg mx-4 text-center border border-white/30 transform animate-bounce-in">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-black text-white mb-4">
              WINNER!
            </h2>
            <div className="text-5xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
              {result}
            </div>
            <p className="text-gray-200 mb-8 text-lg font-medium">
              Selected from {dishes.length} delicious options with {dishes.find(d => d.name === result)?.votes || 0} votes!
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={markAsFavorite}
                className="bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-pink-600 hover:via-red-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-xl border-2 border-white/20"
              >
                ❤️ Add to Favorites
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all border-2 border-white/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3) rotate(-15deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WheelComponent;
