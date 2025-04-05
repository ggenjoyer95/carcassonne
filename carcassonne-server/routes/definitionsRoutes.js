// carcassonne-server/routes/definitionsRoutes.js

const express = require('express');
const { getTileDefinitions } = require('../controllers/definitionsController');

const router = express.Router();

// Маршрут для получения определений плиток
router.get('/tile-definitions', getTileDefinitions);

module.exports = router;