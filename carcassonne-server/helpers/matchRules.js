// carcassonne-server/helpers/matchRules.js

// Импортируем определения плиток и функции для работы с сегментами
const tileDefinitionsData = require('../data/tileDefinitions');
const { getEdgeSegments } = require('./tileSegments');

// Определяем типы областей
const AREA_TYPES = {
  CASTLE: 'castle',
  ROAD: 'road',
  FIELD: 'field'
};

/**
 * Получает эффективные грани плитки с учетом поворота
 * @param {Object} tile - Объект плитки
 * @returns {Array} - Массив индексов граней с учетом поворота
 */
function getEffectiveEdgeIndices(tile) {
  // Поворот указывается в градусах (0, 90, 180, 270)
  const rotations = (((tile.rotation % 360) + 360) % 360) / 90;
  
  // Базовые индексы граней: 0 - север, 1 - восток, 2 - юг, 3 - запад
  let effectiveIndices = [0, 1, 2, 3];
  
  // Применяем поворот
  for (let i = 0; i < rotations; i++) {
    effectiveIndices.unshift(effectiveIndices.pop());
  }
  
  return effectiveIndices;
}

/**
 * Проверяет, совпадают ли сегменты двух граней
 * @param {Array} segments1 - Сегменты первой грани
 * @param {Array} segments2 - Сегменты второй грани (в обратном порядке)
 * @returns {boolean} - true, если сегменты совпадают, иначе false
 */
function canMatchSegments(segments1, segments2) {
  // Если количество сегментов не совпадает, грани не могут совпадать
  if (segments1.length !== segments2.length) return false;
  
  // Для каждого сегмента первой грани проверяем соответствующий сегмент второй грани
  // Сегменты второй грани нужно проверять в обратном порядке
  for (let i = 0; i < segments1.length; i++) {
    const segment1 = segments1[i];
    const segment2 = segments2[segments2.length - 1 - i];
    
    // Проверяем, совпадают ли типы областей сегментов
    if (segment1.area !== segment2.area) return false;
  }
  
  return true;
}

/**
 * Проверяет, можно ли разместить плитку на указанной позиции
 * @param {Object} board - Объект игрового поля
 * @param {Object} tile - Объект плитки
 * @param {number} x - Координата x
 * @param {number} y - Координата y
 * @returns {boolean} - true, если плитку можно разместить, иначе false
 */
function validateTilePlacement(board, tile, x, y) {
  // Получаем эффективные индексы граней с учетом поворота
  const effectiveEdgeIndices = getEffectiveEdgeIndices(tile);
  let hasNeighbor = false;

  // Определяем направления: dx, dy, индекс грани нового тайла и индекс противоположной грани соседа
  const directions = [
    { dx: 0, dy: -1, edgeIndex: 0, oppositeIndex: 2 }, // Север: верхняя грань нового и нижняя грань соседа
    { dx: 1, dy: 0, edgeIndex: 1, oppositeIndex: 3 },  // Восток: правая грань нового и левая грань соседа
    { dx: 0, dy: 1, edgeIndex: 2, oppositeIndex: 0 },  // Юг: нижняя грань нового и верхняя грань соседа
    { dx: -1, dy: 0, edgeIndex: 3, oppositeIndex: 1 }  // Запад: левая грань нового и правая грань соседа
  ];

  for (const {dx, dy, edgeIndex, oppositeIndex} of directions) {
    const neighborKey = `${x + dx},${y + dy}`;
    const neighbor = board[neighborKey];
    
    if (neighbor !== undefined && neighbor !== null) {
      hasNeighbor = true;
      
      // Получаем реальные индексы граней с учетом поворота
      const tileEdgeIndex = effectiveEdgeIndices[edgeIndex];
      const neighborEffectiveIndices = getEffectiveEdgeIndices(neighbor);
      const neighborEdgeIndex = neighborEffectiveIndices[oppositeIndex];
      
      // Получаем сегменты граней
      const tileSegments = getEdgeSegments(tile.type, tileEdgeIndex);
      const neighborSegments = getEdgeSegments(neighbor.type, neighborEdgeIndex);
      
      // Проверяем, совпадают ли сегменты
      if (!canMatchSegments(tileSegments, neighborSegments)) {
        // Если хотя бы одна пара граней не совпадает – ход недопустим
        return false;
      }
    }
  }
  
  // Если соседей нет вовсе – ход недопустим согласно правилам
  return hasNeighbor;
}

// Для обратной совместимости с существующим кодом
function getEffectiveEdges(tile) {
  // Получаем эффективные индексы граней с учетом поворота
  const effectiveIndices = getEffectiveEdgeIndices(tile);
  
  // Преобразуем индексы в типы граней (для совместимости со старым кодом)
  return effectiveIndices.map(index => {
    const segments = getEdgeSegments(tile.type, index);
    // Если грань состоит из одного сегмента, возвращаем его тип
    // Иначе возвращаем тип первого сегмента (для совместимости)
    return segments.length === 1 ? segments[0].area : segments[0].area;
  });
}

// Для обратной совместимости с существующим кодом
function canMatch(edge1, edge2) {
  return edge1 === edge2;
}

module.exports = {
  AREA_TYPES,
  getEffectiveEdgeIndices,
  getEffectiveEdges, // Для обратной совместимости
  canMatchSegments,
  canMatch, // Для обратной совместимости
  validateTilePlacement
};
