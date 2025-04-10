const db = require("../db/db");

async function createHistory(historyData) {
  try {
    const formattedHistory = {
      ...historyData,
      participants: JSON.stringify(historyData.participants),
    };
    const [created] = await db("game_history")
      .insert(formattedHistory)
      .returning("*");
    return created;
  } catch (error) {
    console.error("Error creating game history:", error);
    throw error;
  }
}

async function getHistoryByGameId(gameId) {
  try {
    return await db("game_history").where({ game_id: gameId });
  } catch (error) {
    console.error("Error fetching game history:", error);
    throw error;
  }
}

async function getHistoryByUsername(username) {
  try {
    return await db("game_history").whereRaw("participants::jsonb @> ?", [
      JSON.stringify([{ username }]),
    ]);
  } catch (error) {
    console.error("Error fetching game history by username:", error);
    throw error;
  }
}

module.exports = {
  createHistory,
  getHistoryByGameId,
  getHistoryByUsername,
};
