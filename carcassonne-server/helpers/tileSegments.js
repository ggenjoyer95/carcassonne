// carcassonne-server/helpers/tileSegments.js

// Импортируем определения областей из локального файла
const tileDefinitions = require('../data/tileDefinitions');

// Используем данные из определений для бэкенда
// Без полигонов, которые нужны только для фронтенда
const tileAreas = {
  photo1: tileDefinitions.photo1.map(area => ({
    name: area.name,
    type: area.type
  })),
  photo2: tileDefinitions.photo2.map(area => ({
    name: area.name,
    type: area.type
  })),
  castlewithenter: tileDefinitions.castlewithenter.map(area => ({
    name: area.name,
    type: area.type
  }))
};

/**
 * Находит информацию об области по её имени
 * @param {string} tileType - Тип плитки (например, "photo1")
 * @param {string} areaName - Имя области (например, "cityArea")
 * @returns {Object|null} - Объект с информацией об области или null, если область не найдена
 */
function findAreaByName(tileType, areaName) {
  // Получаем все области для указанного типа плитки
  const areas = tileAreas[tileType];
  if (!areas) return null;
  
  // Ищем область с указанным именем
  return areas.find(area => area.name === areaName) || null;
}

module.exports = {
  tileAreas,
  findAreaByName
};
