import React, { useState, useEffect } from 'react';
import { Users, Trophy, Target, BarChart3, Settings, Play, Pause, Plus, Minus, DollarSign, Home, Car, Dice1, Crown, Medal, Award, Clock, Save, Edit3, MapPin, Building, ShoppingCart, Gavel, AlertCircle, CheckCircle, Download, FileText, Database, Code } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('game-tracker');
  const [isGameActive, setIsGameActive] = useState(false);
  
  const [tournaments, setTournaments] = useState([]);

  const [players, setPlayers] = useState([]);

  const [currentGame, setCurrentGame] = useState({
    id: null,
    players: [],
    currentTurn: 0,
    gameTime: 0,
    status: "setup",
    round: 0,
    bankMoney: 15140,
    housesRemaining: 32,
    hotelsRemaining: 12,
    startTime: null
  });

  const [gameEvents, setGameEvents] = useState([]);

  const [newEvent, setNewEvent] = useState({ player: '', event: '', type: 'other' });
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerToken, setNewPlayerToken] = useState('Car');
  
  const monopolyBoard = [
    "Go", "Mediterranean Ave", "Community Chest", "Baltic Ave", "Income Tax", "Reading Railroad",
    "Oriental Ave", "Chance", "Vermont Ave", "Connecticut Ave", "Jail", "St. Charles Place",
    "Electric Company", "States Ave", "Virginia Ave", "Pennsylvania Railroad", "St. James Place",
    "Community Chest", "Tennessee Ave", "New York Ave", "Free Parking", "Kentucky Ave",
    "Chance", "Indiana Ave", "Illinois Ave", "B&O Railroad", "Atlantic Ave", "Ventnor Ave",
    "Water Works", "Marvin Gardens", "Go to Jail", "Pacific Ave", "North Carolina Ave",
    "Community Chest", "Pennsylvania Ave", "Short Line", "Chance", "Park Place", "Luxury Tax", "Boardwalk"
  ];

  const properties = [
    "Mediterranean Ave", "Baltic Ave", "Oriental Ave", "Vermont Ave", "Connecticut Ave",
    "St. Charles Place", "States Ave", "Virginia Ave", "St. James Place", "Tennessee Ave",
    "New York Ave", "Kentucky Ave", "Indiana Ave", "Illinois Ave", "Atlantic Ave",
    "Ventnor Ave", "Marvin Gardens", "Pacific Ave", "North Carolina Ave", "Pennsylvania Ave",
    "Park Place", "Boardwalk", "Reading Railroad", "Pennsylvania Railroad", "B&O Railroad",
    "Short Line", "Electric Company", "Water Works"
  ];

  const tokens = ["Car", "Dog", "Hat", "Ship", "Shoe", "Thimble", "Wheelbarrow", "Iron"];
  const eventTypes = ["purchase", "sale", "rent", "go", "jail", "chance", "community", "tax", "other"];

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    
    const newPlayer = {
      id: Date.now(),
      name: newPlayerName.trim(),
      email: '',
      wins: 0,
      totalGames: 0,
      winRate: 0,
      avgGameTime: 0,
      preferredToken: newPlayerToken,
      totalWinnings: 0,
      rank: players.length + 1
    };
    
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    
    // Auto-select first player for transactions if none selected
    if (!selectedPlayer) {
      setSelectedPlayer(newPlayer.id);
    }
  };

  const addPlayerToGame = (player) => {
    if (currentGame.players.find(p => p.id === player.id)) return;
    
    const gamePlayer = {
      id: player.id,
      name: player.name,
      money: 1500,
      position: "Go",
      positionNumber: 0,
      properties: [],
      houses: {},
      hotels: {},
      inJail: false,
      jailTurns: 0,
      token: player.preferredToken,
      netWorth: 1500,
      lastRoll: [0, 0],
      doublesCount: 0,
      passedGo: 0,
      rentPaid: 0,
      rentReceived: 0
    };
    
    setCurrentGame(prev => ({
      ...prev,
      players: [...prev.players, gamePlayer]
    }));
  };

  const startGame = () => {
    if (currentGame.players.length < 2) return;
    
    setCurrentGame(prev => ({
      ...prev,
      id: Date.now(),
      status: 'active',
      startTime: new Date().toISOString(),
      round: 1
    }));
    
    addGameEvent("Game started!", currentGame.players[0].id, 'other');
    setIsGameActive(true);
  };

  const endGame = (winnerId) => {
    const winner = currentGame.players.find(p => p.id === winnerId);
    if (!winner) return;

    setCurrentGame(prev => ({ ...prev, status: 'completed' }));
    
    // Update player stats
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        const gamePlayer = currentGame.players.find(gp => gp.id === player.id);
        if (!gamePlayer) return player;
        
        const newTotalGames = player.totalGames + 1;
        const newWins = player.wins + (player.id === winnerId ? 1 : 0);
        const newWinRate = Math.round((newWins / newTotalGames) * 100);
        
        return {
          ...player,
          totalGames: newTotalGames,
          wins: newWins,
          winRate: newWinRate,
          totalWinnings: player.totalWinnings + (player.id === winnerId ? gamePlayer.netWorth : 0)
        };
      })
    );
    
    addGameEvent(`${winner.name} wins the game!`, winnerId, 'other');
    setIsGameActive(false);
  };

  const updatePlayerMoney = (playerId, amount) => {
    if (!amount || isNaN(amount)) return;
    
    setCurrentGame(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId 
          ? { ...player, money: Math.max(0, player.money + parseInt(amount)), netWorth: player.netWorth + parseInt(amount) }
          : player
      )
    }));
    
    addGameEvent(`Money ${amount > 0 ? 'added' : 'deducted'}: $${Math.abs(amount)}`, playerId, amount > 0 ? 'other' : 'tax');
    setTransactionAmount('');
  };

  const updatePlayerPosition = (playerId, newPosition) => {
    const positionNumber = monopolyBoard.indexOf(newPosition);
    if (positionNumber === -1) return;

    setCurrentGame(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId 
          ? { ...player, position: newPosition, positionNumber: positionNumber }
          : player
      )
    }));
    
    addGameEvent(`Moved to ${newPosition}`, playerId, 'other');
  };

  const addProperty = (playerId, property, price = 0) => {
    if (!property) return;
    
    setCurrentGame(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              properties: [...player.properties, property],
              money: player.money - price,
              netWorth: player.netWorth + (price * 0.5) // Rough property value
            }
          : player
      )
    }));
    
    addGameEvent(`Purchased ${property} for $${price}`, playerId, 'purchase');
  };

  const updateHouses = (playerId, property, houses) => {
    setCurrentGame(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              houses: { ...player.houses, [property]: houses },
              netWorth: player.netWorth + (houses * 50) // Rough house value
            }
          : player
      ),
      housesRemaining: prev.housesRemaining - houses
    }));
    
    addGameEvent(`Built ${houses} house(s) on ${property}`, playerId, 'purchase');
  };

  const toggleJail = (playerId) => {
    setCurrentGame(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              inJail: !player.inJail, 
              jailTurns: player.inJail ? 0 : 1,
              position: player.inJail ? "Just Visiting" : "Jail",
              positionNumber: 10
            }
          : player
      )
    }));
    
    const player = currentGame.players.find(p => p.id === playerId);
    addGameEvent(player.inJail ? "Released from Jail" : "Sent to Jail", playerId, 'jail');
  };

  const nextTurn = () => {
    setCurrentGame(prev => ({
      ...prev,
      currentTurn: (prev.currentTurn + 1) % prev.players.length,
      round: prev.currentTurn === prev.players.length - 1 ? prev.round + 1 : prev.round
    }));
  };

  const addGameEvent = (eventText, playerId, type = 'other') => {
    const player = currentGame.players.find(p => p.id === playerId) || { name: 'System' };
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setGameEvents(prev => [{
      id: Date.now(),
      time: timeStr,
      player: player.name,
      event: eventText,
      type: type,
      timestamp: now.toISOString()
    }, ...prev.slice(0, 99)]); // Keep last 100 events
  };

  const recordDiceRoll = (playerId, die1, die2) => {
    setCurrentGame(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              lastRoll: [parseInt(die1), parseInt(die2)],
              doublesCount: die1 === die2 ? player.doublesCount + 1 : 0
            }
          : player
      )
    }));
    
    addGameEvent(`Rolled ${die1} and ${die2} (${parseInt(die1) + parseInt(die2)})`, playerId, 'other');
  };

  // Export Functions
  const exportToCSV = (data, filename) => {
    let csvContent = '';
    
    if (filename === 'players') {
      csvContent = 'Name,Email,Wins,Total Games,Win Rate,Avg Game Time,Preferred Token,Total Winnings,Rank\n';
      players.forEach(player => {
        csvContent += `${player.name},${player.email},${player.wins},${player.totalGames},${player.winRate}%,${player.avgGameTime}m,${player.preferredToken},${player.totalWinnings},${player.rank}\n`;
      });
    } else if (filename === 'game-events') {
      csvContent = 'Time,Player,Event,Type,Timestamp\n';
      gameEvents.forEach(event => {
        csvContent += `${event.time},"${event.player}","${event.event}",${event.type},${event.timestamp}\n`;
      });
    } else if (filename === 'current-game') {
      csvContent = 'Player,Money,Net Worth,Position,Properties Count,In Jail,Passes GO,Rent Paid,Rent Received\n';
      currentGame.players.forEach(player => {
        csvContent += `${player.name},${player.money},${player.netWorth},${player.position},${player.properties.length},${player.inJail},${player.passedGo},${player.rentPaid},${player.rentReceived}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data, filename) => {
    let jsonData;
    
    if (filename === 'full-tournament') {
      jsonData = {
        tournaments,
        players,
        currentGame,
        gameEvents,
        exportDate: new Date().toISOString()
      };
    } else if (filename === 'players') {
      jsonData = { players, exportDate: new Date().toISOString() };
    } else if (filename === 'current-game') {
      jsonData = { currentGame, gameEvents, exportDate: new Date().toISOString() };
    }
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToHTML = (filename) => {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mr. Big Penta's Rolls 2 Riches - Tournament Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
          .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .section { background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #404040; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #404040; padding: 8px; text-align: left; }
          th { background: #404040; color: #fff; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          .stat-card { background: #383838; padding: 15px; border-radius: 8px; text-align: center; }
          .highlight { color: #10b981; font-weight: bold; }
          .timestamp { color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎩 Mr. Big Penta's Rolls 2 Riches - Tournament Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    `;

    if (players.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>📊 Tournament Players</h2>
          <table>
            <thead>
              <tr><th>Rank</th><th>Player</th><th>Wins</th><th>Games</th><th>Win Rate</th><th>Total Winnings</th></tr>
            </thead>
            <tbody>
      `;
      
      players.sort((a, b) => b.wins - a.wins).forEach((player, index) => {
        htmlContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td class="highlight">${player.wins}</td>
            <td>${player.totalGames}</td>
            <td>${player.winRate}%</td>
            <td class="highlight">$${player.totalWinnings.toLocaleString()}</td>
          </tr>
        `;
      });
      
      htmlContent += '</tbody></table></div>';
    }

    if (currentGame.players.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>🎮 Current Game State</h2>
          <div class="stats">
            <div class="stat-card">
              <h3>Game Status</h3>
              <p class="highlight">${currentGame.status.toUpperCase()}</p>
            </div>
            <div class="stat-card">
              <h3>Round</h3>
              <p class="highlight">${currentGame.round}</p>
            </div>
            <div class="stat-card">
              <h3>Game Time</h3>
              <p class="highlight">${formatTime(currentGame.gameTime)}</p>
            </div>
            <div class="stat-card">
              <h3>Bank Money</h3>
              <p class="highlight">$${currentGame.bankMoney.toLocaleString()}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr><th>Player</th><th>Money</th><th>Net Worth</th><th>Position</th><th>Properties</th><th>Status</th></tr>
            </thead>
            <tbody>
      `;
      
      currentGame.players.forEach((player, index) => {
        htmlContent += `
          <tr ${index === currentGame.currentTurn ? 'style="background: #1e40af; color: white;"' : ''}>
            <td>${player.name} ${index === currentGame.currentTurn ? '👑' : ''}</td>
            <td class="highlight">$${player.money.toLocaleString()}</td>
            <td>$${player.netWorth.toLocaleString()}</td>
            <td>${player.position}</td>
            <td>${player.properties.length}</td>
            <td>${player.inJail ? '🔒 Jail' : '✅ Active'}</td>
          </tr>
        `;
      });
      
      htmlContent += '</tbody></table></div>';
    }

    if (gameEvents.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>📝 Recent Game Events</h2>
          <table>
            <thead>
              <tr><th>Time</th><th>Player</th><th>Event</th><th>Type</th></tr>
            </thead>
            <tbody>
      `;
      
      gameEvents.slice(0, 20).forEach(event => {
        htmlContent += `
          <tr>
            <td class="timestamp">${event.time}</td>
            <td>${event.player}</td>
            <td>${event.event}</td>
            <td>${event.type}</td>
          </tr>
        `;
      });
      
      htmlContent += '</tbody></table></div>';
    }

    htmlContent += `
      <div class="section">
        <p class="timestamp">Report generated by Mr. Big Penta's Rolls 2 Riches on ${new Date().toLocaleString()}</p>
      </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tournament-report.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentGame.status === 'active') {
        setCurrentGame(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentGame.status]);

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getPlayerById = (id) => currentGame.players.find(p => p.id === id);

  const renderGameSetup = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Game Setup</h3>
        
        {/* Add Players to Tournament */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-3">Add Tournament Player</h4>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <select 
              value={newPlayerToken} 
              onChange={(e) => setNewPlayerToken(e.target.value)}
              className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-400"
            >
              {tokens.map(token => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
            <button 
              onClick={addPlayer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
            >
              Add Player
            </button>
          </div>
        </div>

        {/* Available Players */}
        {players.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-3">Available Players</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{player.name}</p>
                    <p className="text-sm text-gray-400">Token: {player.preferredToken} | {player.wins}W-{player.totalGames - player.wins}L</p>
                  </div>
                  <button
                    onClick={() => addPlayerToGame(player)}
                    disabled={currentGame.players.find(p => p.id === player.id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      currentGame.players.find(p => p.id === player.id)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {currentGame.players.find(p => p.id === player.id) ? 'In Game' : 'Add to Game'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Game Players */}
        {currentGame.players.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-3">Game Players ({currentGame.players.length})</h4>
            <div className="space-y-2">
              {currentGame.players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{player.name}</p>
                    <p className="text-sm text-gray-400">Starting with ${player.money} | Token: {player.token}</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentGame(prev => ({
                        ...prev,
                        players: prev.players.filter(p => p.id !== player.id)
                      }));
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Game Button */}
        {currentGame.players.length >= 2 && (
          <div className="text-center">
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
            >
              🎮 Start Game ({currentGame.players.length} Players)
            </button>
          </div>
        )}

        {currentGame.players.length < 2 && (
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <p className="text-gray-400">Add at least 2 players to start the game</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGameTracker = () => {
    if (currentGame.status === 'setup' || currentGame.players.length === 0) {
      return renderGameSetup();
    }

    return (
      <div className="space-y-6">
        {/* Game Controls */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Dice1 className="h-6 w-6 text-green-400" />
                Game Control Center
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentGame.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={`text-sm font-medium ${currentGame.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                  {currentGame.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">Round {currentGame.round}</span>
              <span className="text-gray-300 text-sm">Time: {formatTime(currentGame.gameTime)}</span>
              <button 
                onClick={() => setCurrentGame(prev => ({ ...prev, status: prev.status === 'active' ? 'paused' : 'active' }))}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  currentGame.status === 'active' 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {currentGame.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {currentGame.status === 'active' ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <label className="block text-gray-300 text-sm mb-2">Quick Transaction</label>
              <div className="flex gap-2">
                <select 
                  value={selectedPlayer} 
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="flex-1 bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500 focus:border-blue-400"
                >
                  <option value="">Select Player</option>
                  {currentGame.players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder="Amount" 
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="w-24 bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500 focus:border-blue-400"
                />
                <button 
                  onClick={() => selectedPlayer && updatePlayerMoney(parseInt(selectedPlayer), parseInt(transactionAmount))}
                  disabled={!selectedPlayer || !transactionAmount}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  +
                </button>
                <button 
                  onClick={() => selectedPlayer && updatePlayerMoney(parseInt(selectedPlayer), -parseInt(transactionAmount))}
                  disabled={!selectedPlayer || !transactionAmount}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  -
                </button>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <label className="block text-gray-300 text-sm mb-2">Move Player</label>
              <div className="flex gap-2">
                <select 
                  value={selectedProperty} 
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="flex-1 bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500 focus:border-blue-400"
                >
                  <option value="">Select Position</option>
                  {monopolyBoard.map((space, idx) => (
                    <option key={idx} value={space}>{space}</option>
                  ))}
                </select>
                <button 
                  onClick={() => selectedPlayer && selectedProperty && updatePlayerPosition(parseInt(selectedPlayer), selectedProperty)}
                  disabled={!selectedPlayer || !selectedProperty}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
                >
                  <MapPin className="h-4 w-4" />
                  Move
                </button>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <label className="block text-gray-300 text-sm mb-2">Bank Status</label>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Houses: {currentGame.housesRemaining}</span>
                <span className="text-gray-300 text-sm">Hotels: {currentGame.hotelsRemaining}</span>
                <span className="text-green-400 font-medium">${currentGame.bankMoney}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Tracking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentGame.players.map((player, index) => (
            <div 
              key={player.id} 
              className={`bg-gray-800 rounded-xl p-6 border-2 transition-all duration-200 ${
                index === currentGame.currentTurn 
                  ? 'border-blue-400 shadow-lg shadow-blue-400/20' 
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{player.name}</h4>
                    <span className="text-gray-400 text-sm">{player.token}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index === currentGame.currentTurn && (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Current Turn
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => endGame(player.id)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Declare Winner
                  </button>
                </div>
              </div>

              {/* Player Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Cash</span>
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="font-bold text-green-400 text-lg">${player.money}</span>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Net Worth</span>
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="font-bold text-blue-400 text-lg">${player.netWorth}</span>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Position</span>
                    <MapPin className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="font-medium text-white text-sm">{player.position}</span>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Properties</span>
                    <Building className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="font-bold text-orange-400 text-lg">{player.properties.length}</span>
                </div>
              </div>

              {/* Dice Roll Tracking */}
              <div className="bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Dice Roll</span>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      min="1" 
                      max="6" 
                      placeholder="D1"
                      className="w-12 h-8 bg-gray-600 text-white text-center rounded border border-gray-500 text-sm"
                      onChange={(e) => {
                        const die2Input = e.target.parentElement.querySelector('.die2');
                        if (e.target.value && die2Input.value) {
                          recordDiceRoll(player.id, e.target.value, die2Input.value);
                        }
                      }}
                    />
                    <input 
                      type="number" 
                      min="1" 
                      max="6" 
                      placeholder="D2"
                      className="die2 w-12 h-8 bg-gray-600 text-white text-center rounded border border-gray-500 text-sm"
                      onChange={(e) => {
                        const die1Input = e.target.parentElement.querySelector('input[placeholder="D1"]');
                        if (e.target.value && die1Input.value) {
                          recordDiceRoll(player.id, die1Input.value, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">
                    {player.lastRoll[0]} + {player.lastRoll[1]} = {player.lastRoll[0] + player.lastRoll[1]}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    player.doublesCount > 0 ? 'bg-yellow-600 text-yellow-100' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {player.doublesCount > 0 ? `${player.doublesCount} Double${player.doublesCount > 1 ? 's' : ''}` : 'No Doubles'}
                  </span>
                </div>
              </div>

              {/* Player Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => toggleJail(player.id)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    player.inJail 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  <Gavel className="h-4 w-4" />
                  {player.inJail ? `Jail (${player.jailTurns}/3)` : 'Send to Jail'}
                </button>

                <button
                  onClick={() => {
                    const newCount = player.passedGo + 1;
                    setCurrentGame(prev => ({
                      ...prev,
                      players: prev.players.map(p => 
                        p.id === player.id ? { ...p, passedGo: newCount, money: p.money + 200 } : p
                      )
                    }));
                    addGameEvent("Passed GO, collected $200", player.id, 'go');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Home className="h-4 w-4" />
                  Pass GO ({player.passedGo})
                </button>
              </div>

              {/* Property Management */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Property Actions</span>
                  <Building className="h-4 w-4 text-orange-400" />
                </div>
                <div className="flex gap-2 mb-2">
                  <select 
                    className="flex-1 bg-gray-600 text-white rounded px-2 py-1 text-sm border border-gray-500"
                    onChange={(e) => e.target.value && addProperty(player.id, e.target.value, 200)}
                    defaultValue=""
                  >
                    <option value="">Add Property</option>
                    {properties.filter(prop => !player.properties.includes(prop)).map(prop => (
                      <option key={prop} value={prop}>{prop}</option>
                    ))}
                  </select>
                </div>
                
                {player.properties.length > 0 && (
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {player.properties.slice(0, 3).map((prop, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-600 px-2 py-1 rounded text-xs">
                        <span className="text-gray-200">{prop}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">H:{player.houses[prop] || 0}</span>
                          {player.hotels[prop] && <span className="text-yellow-400">★</span>}
                        </div>
                      </div>
                    ))}
                    {player.properties.length > 3 && (
                      <div className="text-center text-gray-400 text-xs">+{player.properties.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Game Events and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Game Events Log
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {gameEvents.length === 0 ? (
                <div className="text-center p-4 text-gray-400">
                  No events recorded yet. Start playing to see events here.
                </div>
              ) : (
                gameEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400 text-xs font-mono whitespace-nowrap">{event.time}</span>
                    <div className="flex-1">
                      <span className="text-blue-400 text-sm font-medium">{event.player}</span>
                      <p className="text-gray-200 text-sm">{event.event}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.type === 'purchase' ? 'bg-green-600 text-green-100' :
                      event.type === 'rent' ? 'bg-red-600 text-red-100' :
                      event.type === 'jail' ? 'bg-orange-600 text-orange-100' :
                      event.type === 'go' ? 'bg-blue-600 text-blue-100' :
                      'bg-gray-600 text-gray-100'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Turn Control</h4>
            
            <div className="space-y-4">
              {currentGame.players.length > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {currentGame.players[currentGame.currentTurn]?.name}
                  </div>
                  <div className="text-gray-400 text-sm mb-4">Current Player's Turn</div>
                  
                  <button
                    onClick={nextTurn}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    Next Turn
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <h5 className="text-gray-300 text-sm mb-2">Add Custom Event</h5>
                <div className="space-y-2">
                  <select 
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input 
                    type="text"
                    placeholder="Event description"
                    value={newEvent.event}
                    onChange={(e) => setNewEvent({...newEvent, event: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                  />
                  <button 
                    onClick={() => {
                      if (newEvent.event && selectedPlayer) {
                        addGameEvent(newEvent.event, parseInt(selectedPlayer), newEvent.type);
                        setNewEvent({ player: '', event: '', type: 'other' });
                      }
                    }}
                    disabled={!newEvent.event || !selectedPlayer}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Tournament Players</h3>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToCSV(players, 'players')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-700 text-center">
          <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Players Yet</h3>
          <p className="text-gray-400 mb-6">Add players to start tracking tournaments</p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="flex-1 bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-400"
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              />
              <select 
                value={newPlayerToken} 
                onChange={(e) => setNewPlayerToken(e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-400"
              >
                {tokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
              <button 
                onClick={addPlayer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Player</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Tournament Stats</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Performance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Earnings</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-white">{player.name}</p>
                          <p className="text-sm text-gray-400">{player.email || 'No email'}</p>
                          <p className="text-xs text-gray-500">Token: {player.preferredToken}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300"><span className="font-medium text-green-400">{player.wins}</span> wins</p>
                        <p className="text-sm text-gray-300"><span className="font-medium text-blue-400">{player.totalGames}</span> games</p>
                        <p className="text-sm text-gray-300"><span className="font-medium text-purple-400">{player.winRate}%</span> win rate</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">Avg: <span className="font-medium text-orange-400">{player.avgGameTime}m</span></p>
                        <p className="text-sm text-gray-300">Rank: <span className="font-medium text-yellow-400">#{player.rank}</span></p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          player.rank <= 3 ? 'bg-green-900 text-green-300' : 
                          player.rank <= 8 ? 'bg-blue-900 text-blue-300' : 
                          'bg-gray-900 text-gray-300'
                        }`}>
                          {player.rank <= 3 ? 'Elite' : player.rank <= 8 ? 'Skilled' : 'Amateur'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-green-400">${player.totalWinnings.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Tournament earnings</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Edit</button>
                        <button 
                          onClick={() => setPlayers(players.filter(p => p.id !== player.id))}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Players</p>
              <p className="text-3xl font-bold">{players.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Games Completed</p>
              <p className="text-3xl font-bold">{players.reduce((acc, p) => acc + p.totalGames, 0)}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-300" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Events Logged</p>
              <p className="text-3xl font-bold">{gameEvents.length}</p>
            </div>
            <Target className="h-8 w-8 text-purple-300" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm">Current Game</p>
              <p className="text-3xl font-bold">{currentGame.status === 'active' ? formatTime(currentGame.gameTime) : 'None'}</p>
            </div>
            <Play className="h-8 w-8 text-orange-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            Tournament Leaderboard
          </h3>
          {players.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No players added yet</p>
              <p className="text-sm">Add players to see leaderboard</p>
            </div>
          ) : (
            <div className="space-y-3">
              {players.sort((a, b) => b.wins - a.wins).slice(0, 5).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-500' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{player.name}</p>
                      <p className="text-sm text-gray-400">{player.wins} wins • {player.winRate}% win rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${player.totalWinnings.toLocaleString()}</p>
                    {index < 3 && (
                      <Medal className={`h-5 w-5 inline ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-400' : 
                        'text-orange-400'
                      }`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Live Game Status
          </h3>
          {currentGame.players.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <Play className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active game</p>
              <p className="text-sm">Start a game to see live stats</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">Current Leader</p>
                  <p className="text-sm text-gray-400">By net worth</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">
                    {[...currentGame.players].sort((a, b) => b.netWorth - a.netWorth)[0]?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    ${[...currentGame.players].sort((a, b) => b.netWorth - a.netWorth)[0]?.netWorth?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">Most Properties</p>
                  <p className="text-sm text-gray-400">Property count</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-400">
                    {[...currentGame.players].sort((a, b) => b.properties.length - a.properties.length)[0]?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {[...currentGame.players].sort((a, b) => b.properties.length - a.properties.length)[0]?.properties.length || 0} properties
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">Most Cash</p>
                  <p className="text-sm text-gray-400">Liquid money</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-400">
                    {[...currentGame.players].sort((a, b) => b.money - a.money)[0]?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    ${[...currentGame.players].sort((a, b) => b.money - a.money)[0]?.money?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-green-400" />
          Export Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-white">Player Data</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => exportToCSV(players, 'players')}
                disabled={players.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <FileText className="h-4 w-4" />
                CSV
              </button>
              <button 
                onClick={() => exportToJSON(players, 'players')}
                disabled={players.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <Code className="h-4 w-4" />
                JSON
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-white">Game Data</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => exportToCSV(currentGame, 'current-game')}
                disabled={currentGame.players.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <FileText className="h-4 w-4" />
                CSV
              </button>
              <button 
                onClick={() => exportToJSON(currentGame, 'current-game')}
                disabled={currentGame.players.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <Code className="h-4 w-4" />
                JSON
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-white">Complete Report</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => exportToHTML('tournament-report')}
                disabled={players.length === 0 && currentGame.players.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <Database className="h-4 w-4" />
                HTML
              </button>
              <button 
                onClick={() => exportToJSON({}, 'full-tournament')}
                disabled={players.length === 0 && currentGame.players.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <Code className="h-4 w-4" />
                Full JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Tournament Statistics & Analytics</h3>
      
      {players.length === 0 && currentGame.players.length === 0 ? (
        <div className="bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-700 text-center">
          <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">Add players and start games to see statistics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Player Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Players:</span>
                <span className="font-medium text-white">{players.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Games:</span>
                <span className="font-medium text-green-400">{players.reduce((acc, p) => acc + p.totalGames, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Game:</span>
                <span className={`font-medium ${currentGame.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                  {currentGame.status === 'active' ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Events Logged:</span>
                <span className="font-medium text-blue-400">{gameEvents.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Game Progress</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Round:</span>
                <span className="font-medium text-white">{currentGame.round || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Game Time:</span>
                <span className="font-medium text-white">{formatTime(currentGame.gameTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Players in Game:</span>
                <span className="font-medium text-blue-400">{currentGame.players.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bank Money:</span>
                <span className="font-medium text-green-400">${currentGame.bankMoney?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Resource Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Houses Left:</span>
                <span className={`font-medium ${(currentGame.housesRemaining || 0) < 10 ? 'text-red-400' : 'text-green-400'}`}>
                  {currentGame.housesRemaining || 32}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hotels Left:</span>
                <span className={`font-medium ${(currentGame.hotelsRemaining || 0) < 5 ? 'text-orange-400' : 'text-green-400'}`}>
                  {currentGame.hotelsRemaining || 12}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Properties Owned:</span>
                <span className="font-medium text-purple-400">
                  {currentGame.players?.reduce((acc, p) => acc + p.properties.length, 0) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Money in Play:</span>
                <span className="font-medium text-blue-400">
                  ${currentGame.players?.reduce((acc, p) => acc + p.money, 0)?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                {/* Logo placeholder - replace with actual Mr. Big Penta image */}
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">MBP</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mr. Big Penta's Rolls 2 Riches</h1>
                <p className="text-gray-400">Monopoly Tournament game tracking & statistics system</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${currentGame.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={`text-sm font-medium ${currentGame.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                  {currentGame.status === 'active' ? 'TRACKING LIVE' : 'READY'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">September 2025 Tournament</p>
              <p className="font-semibold text-white">{players.length} Players • {gameEvents.length} Events</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-800 rounded-xl shadow-lg mb-6 border border-gray-700">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'game-tracker', label: 'Game Tracker', icon: Play },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'players', label: 'Players', icon: Users },
              { id: 'statistics', label: 'Statistics', icon: Trophy }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="transition-all duration-200">
          {activeTab === 'game-tracker' && renderGameTracker()}
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'players' && renderPlayers()}
          {activeTab === 'statistics' && renderStatistics()}
        </div>
      </div>
    </div>
  );
};

export default App;