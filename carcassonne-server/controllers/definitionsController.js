// carcassonne-server/controllers/definitionsController.js

const tileDefinitions = require('../data/tileDefinitions');

/**
 * Контроллер для предоставления определений плиток
 * Этот эндпоинт позволяет фронтенду получить определения плиток при запуске
 */
const getTileDefinitions = (req, res) => {
  try {
    // Возвращаем определения плиток в формате JSON
    return res.status(200).json(tileDefinitions);
  } catch (error) {
    console.error('Ошибка при отправке определений плиток:', error);
    return res.status(500).json({ errorMessage: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getTileDefinitions
};