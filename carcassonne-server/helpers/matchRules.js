// carcassonne-server/helpers/matchRules.js

// Определяем типы граней
const EDGE_TYPES = {
  CITY: 'city',
  ROAD: 'road',
  FIELD: 'field'
};

// Определяем описание базовых тайлов по их изображениям
const tileDefinitions = {
  photo1: {
    // Здесь указываем порядок граней [север, восток, юг, запад]
    // Пример: сверху (север) – часть города, справа – дорога, снизу – поле, слева – город.
    edges: [EDGE_TYPES.CITY, EDGE_TYPES.FIELD, EDGE_TYPES.ROAD, EDGE_TYPES.ROAD]
  },
  photo2: {
    // Пример: сверху – поле, справа – дорога, снизу – поле, слева – поле
    edges: [EDGE_TYPES.FIELD, EDGE_TYPES.FIELD, EDGE_TYPES.ROAD, EDGE_TYPES.ROAD]
  }
};

function getEffectiveEdges(tile) {
  // tile.type должно быть, например, "photo1" или "photo2"
  const baseEdges = tileDefinitions[tile.type].edges;
  // Поворот указывается в градусах (0, 90, 180, 270)
  const rotations = (((tile.rotation % 360) + 360) % 360) / 90;
  let effectiveEdges = baseEdges.slice();
  for (let i = 0; i < rotations; i++) {
    effectiveEdges.unshift(effectiveEdges.pop());
  }
  return effectiveEdges;
}

function canMatch(edge1, edge2) {
  return edge1 === edge2;
}

function validateTilePlacement(board, tile, x, y) {
  // Получаем эффективные грани нового тайла с учетом поворота
  const effectiveEdges = getEffectiveEdges(tile);
  let hasNeighbor = false;

  // Определяем направления: dx, dy, индекс грани нового тайла и индекс противоположной грани соседа
  const directions = [
    { dx: 0, dy: -1, edgeIndex: 0, oppositeIndex: 2 }, // Север: верхняя грань нового и нижняя грань соседа
    { dx: 1, dy: 0, edgeIndex: 1, oppositeIndex: 3 },   // Восток: правая грань нового и левая грань соседа
    { dx: 0, dy: 1, edgeIndex: 2, oppositeIndex: 0 },   // Юг: нижняя грань нового и верхняя грань соседа
    { dx: -1, dy: 0, edgeIndex: 3, oppositeIndex: 1 }   // Запад: левая грань нового и правая грань соседа
  ];

  for (const {dx, dy, edgeIndex, oppositeIndex} of directions) {
    const neighborKey = `${x + dx},${y + dy}`;
    const neighbor = board[neighborKey];
    if (neighbor !== undefined && neighbor !== null) {
      hasNeighbor = true;
      const neighborEdges = getEffectiveEdges(neighbor);
      if (!canMatch(effectiveEdges[edgeIndex], neighborEdges[oppositeIndex])) {
        // Если хотя бы одна пара граней не совпадает – ход недопустим
        return false;
      }
    }
  }
  // Если соседей нет вовсе – ход недопустим согласно правилам
  return hasNeighbor;
}

module.exports = {
  EDGE_TYPES,
  tileDefinitions,
  getEffectiveEdges,
  canMatch,
  validateTilePlacement
};
