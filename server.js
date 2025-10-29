// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Статика для клиента
app.use(express.static(path.join(__dirname, 'public')));

class MultiplayerGame {
  constructor() {
    this.rooms = new Map();
    this.players = new Map();
  }
  
  createRoom(roomId, locations) {
    this.rooms.set(roomId, {
      locations,
      currentRound: 0,
      players: [],
      scores: {},
      currentTurn: null
    });
  }
  
  joinRoom(socket, roomId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.players.push(socket.id);
    this.players.set(socket.id, {
      roomId,
      playerName,
      socket,
      ready: false
    });
    
    socket.join(roomId);
    
    // Уведомляем всех о новом игроке
    io.to(roomId).emit('playerJoined', {
      playerId: socket.id,
      playerName,
      playersCount: room.players.length
    });
    
    // Если комната заполнена, начинаем игру
    if (room.players.length === 2) {
      this.startGame(roomId);
    }
    
    return true;
  }
  
  startGame(roomId) {
    const room = this.rooms.get(roomId);
    room.currentTurn = room.players[0]; // Первый игрок ходит первым
    
    io.to(roomId).emit('gameStarted', {
      currentPlayer: room.currentTurn,
      round: room.currentRound
    });
    
    this.nextLocation(roomId);
  }
  
  nextLocation(roomId) {
    const room = this.rooms.get(roomId);
    const location = room.locations[room.currentRound];
    
    io.to(roomId).emit('newLocation', {
      location,
      round: room.currentRound,
      totalRounds: room.locations.length,
      currentPlayer: room.currentTurn
    });
  }
  
  handleGuess(socket, data) {
    const player = this.players.get(socket.id);
    if (!player) return;
    
    const room = this.rooms.get(player.roomId);
    if (room.currentTurn !== socket.id) return;
    
    // Сохраняем результат
    if (!room.scores[socket.id]) {
      room.scores[socket.id] = [];
    }
    
    room.scores[socket.id].push({
      round: room.currentRound,
      score: data.score,
      distance: data.distance
    });
    
    // Передаём ход следующему игроку
    this.nextTurn(player.roomId);
  }
  
  nextTurn(roomId) {
    const room = this.rooms.get(roomId);
    const currentIndex = room.players.indexOf(room.currentTurn);
    const nextIndex = (currentIndex + 1) % room.players.length;
    
    room.currentTurn = room.players[nextIndex];
    
    // Если все игроки сделали ход, переходим к следующему раунду
    if (nextIndex === 0) {
      room.currentRound++;
      
      if (room.currentRound >= room.locations.length) {
        this.endGame(roomId);
      } else {
        setTimeout(() => this.nextLocation(roomId), 2000);
      }
    } else {
      io.to(roomId).emit('playerTurn', {
        currentPlayer: room.currentTurn
      });
    }
  }
  
  endGame(roomId) {
    const room = this.rooms.get(roomId);
    const results = this.calculateResults(room);
    
    io.to(roomId).emit('gameEnded', { results });
    
    // Очищаем комнату через некоторое время
    setTimeout(() => {
      this.rooms.delete(roomId);
    }, 30000);
  }
  
  calculateResults(room) {
    const results = {};
    
    for (const playerId of room.players) {
      const playerScores = room.scores[playerId] || [];
      results[playerId] = {
        totalScore: playerScores.reduce((sum, round) => sum + round.score, 0),
        rounds: playerScores,
        playerName: this.players.get(playerId)?.playerName
      };
    }
    
    return results;
  }
}

const game = new MultiplayerGame();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  socket.on('createRoom', (data) => {
    game.createRoom(data.roomId, data.locations);
    game.joinRoom(socket, data.roomId, data.playerName);
  });
  
  socket.on('joinRoom', (data) => {
    const success = game.joinRoom(socket, data.roomId, data.playerName);
    socket.emit(success ? 'roomJoined' : 'roomError', {
      message: success ? 'Success' : 'Room not found'
    });
  });
  
  socket.on('submitGuess', (data) => {
    game.handleGuess(socket, data);
  });
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Обработка отключения игрока
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`BelarusGuessor server running on port ${PORT}`);
});
