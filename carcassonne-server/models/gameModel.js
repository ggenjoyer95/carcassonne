const db = require('../db/db');

class Game {
  constructor(gameId) {
    this.gameId = gameId;
    this.board = {};
    this.players = [];
    this.status = "waiting";
    this.currentTurn = null;
    this.currentMoveMade = false;
    this.imageRotation = 0;
    // Инициализируем deck и remainingCards
    this.deck = []; // здесь будут храниться карточки
    this.remainingCards = 0;
    this.currentTileImage = "";
  }
  
  // Save game to database
  async save() {
    const gameState = {
      gameId: this.gameId,
      board: this.board,
      players: this.players,
      currentTurn: this.currentTurn,
      currentMoveMade: this.currentMoveMade,
      imageRotation: this.imageRotation,
      remainingCards: this.remainingCards,
      currentTileImage: this.currentTileImage,
      deck: this.deck  // обязательно сохраняем deck!
    };

    try {
      // Check if game already exists
      const existingGame = await db('games').where('game_id', this.gameId).first();
      
      if (existingGame) {
        // Update existing game
        await db('games')
          .where('game_id', this.gameId)
          .update({
            game_state: gameState,
            status: this.status,
            updated_at: db.fn.now()
          });
      } else {
        // Insert new game
        await db('games').insert({
          game_id: this.gameId,
          game_state: gameState,
          status: this.status
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  }

  // Find game by ID
  static async findById(gameId) {
    try {
      const gameRecord = await db('games').where('game_id', gameId).first();
      
      if (!gameRecord) {
        return null;
      }
      
      const game = new Game(gameId);
      const gameState = gameRecord.game_state;
      
      // Populate game object with stored state
      game.board = gameState.board || {};
      game.players = gameState.players || [];
      game.status = gameRecord.status;
      game.currentTurn = gameState.currentTurn;
      game.currentMoveMade = gameState.currentMoveMade;
      game.imageRotation = gameState.imageRotation;
      game.remainingCards = gameState.remainingCards;
      game.currentTileImage = gameState.currentTileImage;
      game.deck = gameState.deck || []; // Восстанавливаем deck
      
      return game;
    } catch (error) {
      console.error('Error finding game:', error);
      return null;
    }
  }

  // Update game status
  async updateStatus(status) {
    this.status = status;
    try {
      await db('games')
        .where('game_id', this.gameId)
        .update({
          status: status,
          updated_at: db.fn.now()
        });
      return true;
    } catch (error) {
      console.error('Error updating game status:', error);
      return false;
    }
  }
}

module.exports = Game;
