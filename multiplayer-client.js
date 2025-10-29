// multiplayer-client.js
class MultiplayerClient {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.playerId = null;
    this.isMyTurn = false;
  }
  
  connect() {
    this.socket = io();
    
    this.socket.on('connect', () => {
      this.playerId = this.socket.id;
      console.log('Connected to server');
    });
    
    this.socket.on('playerJoined', this.handlePlayerJoined.bind(this));
    this.socket.on('gameStarted', this.handleGameStarted.bind(this));
    this.socket.on('newLocation', this.handleNewLocation.bind(this));
    this.socket.on('playerTurn', this.handlePlayerTurn.bind(this));
    this.socket.on('gameEnded', this.handleGameEnded.bind(this));
  }
  
  createRoom(playerName, locations) {
    this.roomId = this.generateRoomId();
    this.socket.emit('createRoom', {
      roomId: this.roomId,
      playerName,
      locations
    });
    return this.roomId;
  }
  
  joinRoom(roomId, playerName) {
    this.roomId = roomId;
    this.socket.emit('joinRoom', {
      roomId,
      playerName
    });
  }
  
  submitGuess(guessData) {
    if (!this.isMyTurn) return;
    
    this.socket.emit('submitGuess', {
      ...guessData,
      roomId: this.roomId
    });
    
    this.isMyTurn = false;
  }
  
  handlePlayerJoined(data) {
    console.log(`${data.playerName} joined the room`);
    this.updatePlayersList(data);
  }
  
  handleGameStarted(data) {
    this.isMyTurn = data.currentPlayer === this.playerId;
    this.showGameStartedMessage();
  }
  
  handleNewLocation(data) {
    this.currentLocation = data.location;
    this.loadPanorama(data.location);
    this.updateRoundInfo(data.round, data.totalRounds);
    
    if (this.isMyTurn) {
      this.enableGuessing();
    } else {
      this.disableGuessing();
    }
  }
  
  handlePlayerTurn(data) {
    this.isMyTurn = data.currentPlayer === this.playerId;
    
    if (this.isMyTurn) {
      this.enableGuessing();
      this.showYourTurnMessage();
    }
  }
  
  handleGameEnded(data) {
    this.showFinalResults(data.results);
  }
  
  generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
