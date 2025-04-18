const express = require("express");
const {
  createHistoryRecord,
  getHistoryForGame,
  getHistoryForUser,
} = require("../controllers/historyController");
const router = express.Router();

router.post("/", createHistoryRecord);

router.get("/:gameId", getHistoryForGame);

router.get("/user/:username", getHistoryForUser);

module.exports = router;
