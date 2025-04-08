// carcassonne-server/helpers/tileSegments.js

// Импортируем определения областей из локального файла
const tileDefinitions = require('../data/tileDefinitions');

/**
 * Преобразуем определения плиток в формат, удобный для бэкенда
 * Извлекаем только необходимую информацию об областях без полигонов
 */
const tileAreas = {};

// Заполняем tileAreas данными из tileDefinitions
Object.keys(tileDefinitions).forEach(tileType => {
  if (tileDefinitions[tileType].areas) {
    tileAreas[tileType] = tileDefinitions[tileType].areas.map(area => ({
      name: area.name,
      type: area.type
    }));
  }
});

/**
 * Находит информацию об области по её имени
 * @param {string} tileType - Тип плитки (например, "CastleCenter0")
 * @param {string} areaName - Имя области (например, "castle")
 * @returns {Object|null} - Объект с информацией об области или null, если область не найдена
 */
function findAreaByName(tileType, areaName) {
  // Получаем все области для указанного типа плитки
  const areas = tileAreas[tileType];
  if (!areas) return null;
  
  // Ищем область с указанным именем
  return areas.find(area => area.name === areaName) || null;
}

/**
 * Находит сегмент грани по его индексу
 * @param {string} tileType - Тип плитки
 * @param {number} edgeIndex - Индекс грани (0-3)
 * @param {number} segmentIndex - Индекс сегмента в грани
 * @returns {Object|null} - Объект с информацией о сегменте или null, если сегмент не найден
 */
function findSegmentByIndex(tileType, edgeIndex, segmentIndex) {
  const tileDefinition = tileDefinitions[tileType];
  if (!tileDefinition || !tileDefinition.edges) return null;
  
  const edge = tileDefinition.edges.find(e => e.edge === edgeIndex);
  if (!edge || !edge.segments) return null;
  
  return edge.segments.find(s => s.index === segmentIndex) || null;
}

/**
 * Получает все сегменты грани
 * @param {string} tileType - Тип плитки
 * @param {number} edgeIndex - Индекс грани (0-3)
 * @returns {Array} - Массив сегментов грани
 */
function getEdgeSegments(tileType, edgeIndex) {
  const tileDefinition = tileDefinitions[tileType];
  if (!tileDefinition || !tileDefinition.edges) return [];
  
  const edge = tileDefinition.edges.find(e => e.edge === edgeIndex);
  if (!edge || !edge.segments) return [];
  
  return edge.segments;
}

module.exports = {
  tileAreas,
  findAreaByName,
  findSegmentByIndex,
  getEdgeSegments
};
