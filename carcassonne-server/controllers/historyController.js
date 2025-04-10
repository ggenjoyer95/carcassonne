const GameHistory = require("../models/gameHistoryModel");

const createHistoryRecord = async (req, res) => {
  try {
    const { game_id, played_at, winner } = req.body;
    let participants = req.body.participants;
    if (!participants || participants.length === 0) {
      if (req.user && req.user.username) {
        participants = [{ username: req.user.username }];
      } else {
        return res
          .status(400)
          .json({ errorMessage: "Не указаны участники игры" });
      }
    }
    const history = await GameHistory.createHistory({
      game_id,
      participants,
      played_at,
      winner,
    });
    return res.status(200).json(history);
  } catch (error) {
    console.error("Error in createHistoryRecord:", error);
    return res.status(500).json({ errorMessage: "Внутренняя ошибка сервера" });
  }
};

const getHistoryForGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const history = await GameHistory.getHistoryByGameId(gameId);
    return res.status(200).json(history);
  } catch (error) {
    console.error("Error in getHistoryForGame:", error);
    return res.status(500).json({ errorMessage: "Внутренняя ошибка сервера" });
  }
};

const getHistoryForUser = async (req, res) => {
  try {
    const { username } = req.params;
    const history = await GameHistory.getHistoryByUsername(username);
    return res.status(200).json(history);
  } catch (error) {
    console.error("Error in getHistoryForUser:", error);
    return res.status(500).json({ errorMessage: "Внутренняя ошибка сервера" });
  }
};

module.exports = {
  createHistoryRecord,
  getHistoryForGame,
  getHistoryForUser,
};
