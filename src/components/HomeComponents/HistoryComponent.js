// src/components/HomeComponents/HistoryComponent.js
import React, { useState, useEffect } from 'react';

const HistoryComponent = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('foodspin-token');
      const response = await fetch('http://localhost:5001/api/wheel/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('History data:', data);
        setHistory(data.history || []);
      } else {
        console.error('Failed to fetch history');
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ UPDATED: Helper function to check if there are actual votes
  const hasVotes = (entry) => {
    return entry.winner?.totalVotes && entry.winner.totalVotes > 0;
  };

  // ✅ UPDATED: Helper function to get vote info only if votes exist
  const getVoteInfo = (entry) => {
    if (hasVotes(entry)) {
      return `${entry.winner.totalVotes} votes`;
    }
    return null;
  };

  // ✅ UPDATED: Helper function to check if dish has votes
  const dishHasVotes = (dish) => {
    return dish.votes && dish.votes > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-2xl animate-pulse">Loading history... 📜</div>
      </div>
    );
  }

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
          📜 Spin History
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
          Your previous wheel results and food adventures
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6 animate-bounce">🎲</div>
          <h3 className="text-3xl font-bold text-white mb-4">No spins yet!</h3>
          <p className="text-gray-400 mb-8 text-lg">Start spinning the wheel to see your history here</p>
          <div className="animate-pulse">
            <span className="text-6xl">🍕🍔🍣🌮</span>
          </div>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Enhanced Table Header */}
          <div className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 px-8 py-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                🎯 Total Spins: {history.length}
              </h2>
              <div className="text-sm text-gray-300">
                Latest: {history.length > 0 ? formatDate(history[0].spunAt) : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-black/20">
                  <th className="text-left p-6 text-gray-200 font-bold text-lg">Date & Time</th>
                  <th className="text-left p-6 text-gray-200 font-bold text-lg">Winner</th>
                  <th className="text-left p-6 text-gray-200 font-bold text-lg">All Options</th>
                  <th className="text-left p-6 text-gray-200 font-bold text-lg">Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr 
                    key={entry._id} 
                    className={`border-b border-white/5 hover:bg-white/10 transition-all duration-300 ${
                      index === 0 ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' : ''
                    }`}
                  >
                    <td className="p-6 text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {formatDate(entry.spunAt)}
                        </span>
                        {index === 0 && (
                          <span className="text-xs text-green-400 mt-1">
                            ✨ Latest Spin
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏆</span>
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-lg">{entry.winner.name}</span>
                          
                          {/* ✅ Only show cuisine type if it's not "Unknown" or empty */}
                          {entry.winner.cuisineType && 
                           entry.winner.cuisineType !== 'Unknown' && 
                           entry.winner.cuisineType.trim() !== '' && (
                            <span className="text-xs text-gray-400">
                              🍽️ {entry.winner.cuisineType}
                            </span>
                          )}
                          
                          {/* ✅ UPDATED: Only show vote info if there are actual votes */}
                          {hasVotes(entry) && (
                            <span className="text-xs text-yellow-400">
                              🗳️ {getVoteInfo(entry)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {entry.dishes.slice(0, 4).map((dish, i) => (
                          <span 
                            key={i} 
                            className={`px-3 py-1 rounded-full text-sm font-medium border border-white/20 ${
                              dish.name === entry.winner.name 
                                ? 'bg-green-500/20 text-green-300 border-green-500/40' 
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {dish.name === entry.winner.name && '👑 '}
                            {dish.name}
                            {/* ✅ UPDATED: Only show vote count if dish has votes */}
                            {dishHasVotes(dish) && (
                              <span className="ml-1 text-xs text-gray-400">
                                ({dish.votes}v)
                              </span>
                            )}
                          </span>
                        ))}
                        {entry.dishes.length > 4 && (
                          <span className="text-gray-400 text-sm px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            +{entry.dishes.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {entry.dishes.length} option{entry.dishes.length !== 1 ? 's' : ''} total
                      </div>
                    </td>
                    
                    <td className="p-6 text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {entry.spinDuration ? `${(entry.spinDuration / 1000).toFixed(1)}s` : 'N/A'}
                        </span>
                        <span className="text-xs text-gray-400">
                          spin time
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Footer */}
          <div className="bg-black/20 px-8 py-4 border-t border-white/10">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>
                🎲 Keep spinning to discover new favorites!
              </span>
              <span>
                Total food adventures: {history.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryComponent;
