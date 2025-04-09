const express = require("express");
const {
  joinGame,
  startGame,
  getGameState,
  leaveGame,
  createGame,
  makeMove,
  placeTile,
  endTurn,
  placeMeeple,
  rotateImage,
  cancelAction,
  skipTurn,
} = require("../controllers/gameController");

const router = express.Router();

router.post("/:gameId/join", joinGame);
router.post("/:gameId/start", startGame);
router.post("/:gameId/leave", leaveGame);
router.get("/:gameId", getGameState);
router.post("/:gameId/cancelAction", cancelAction);

module.exports = router;
router.post("/create", createGame);
router.post("/:gameId/move", makeMove);
router.post("/:gameId/placeTile", placeTile);
router.post("/:gameId/endTurn", endTurn);
router.post("/:gameId/placeMeeple", placeMeeple);
router.post("/:gameId/rotateImage", rotateImage);
router.post("/:gameId/skipTurn", skipTurn);
