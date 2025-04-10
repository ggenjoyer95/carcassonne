const db = require("../db/db");

class Game {
  constructor(gameId) {
    this.gameId = gameId;
    this.board = {};
    this.players = [];
    this.status = "waiting";
    this.currentTurn = null;
    this.currentMoveMade = false;
    this.imageRotation = 0;
    this.deck = [];
    this.remainingCards = 0;
    this.currentTileImage = "";
  }

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
      deck: this.deck,
    };

    try {
      const existingGame = await db("games")
        .where("game_id", this.gameId)
        .first();

      if (existingGame) {
        await db("games").where("game_id", this.gameId).update({
          game_state: gameState,
          status: this.status,
          updated_at: db.fn.now(),
        });
      } else {
        await db("games").insert({
          game_id: this.gameId,
          game_state: gameState,
          status: this.status,
        });
      }

      return true;
    } catch (error) {
      console.error("Error saving game:", error);
      return false;
    }
  }

  static async findById(gameId) {
    try {
      const gameRecord = await db("games").where("game_id", gameId).first();

      if (!gameRecord) {
        return null;
      }

      const game = new Game(gameId);
      const gameState = gameRecord.game_state;

      game.board = gameState.board || {};
      game.players = gameState.players || [];
      game.status = gameRecord.status;
      game.currentTurn = gameState.currentTurn;
      game.currentMoveMade = gameState.currentMoveMade;
      game.imageRotation = gameState.imageRotation;
      game.remainingCards = gameState.remainingCards;
      game.currentTileImage = gameState.currentTileImage;
      game.deck = gameState.deck || [];

      return game;
    } catch (error) {
      console.error("Error finding game:", error);
      return null;
    }
  }

  async updateStatus(status) {
    this.status = status;
    try {
      await db("games").where("game_id", this.gameId).update({
        status: status,
        updated_at: db.fn.now(),
      });
      return true;
    } catch (error) {
      console.error("Error updating game status:", error);
      return false;
    }
  }
}

module.exports = Game;
