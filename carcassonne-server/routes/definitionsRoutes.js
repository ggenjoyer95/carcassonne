const express = require("express");
const { getTileDefinitions } = require("../controllers/definitionsController");

const router = express.Router();

router.get("/tile-definitions", getTileDefinitions);

module.exports = router;
