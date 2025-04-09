// carcassonne-server/helpers/tileSegments.js

// Импортируем определения плиток из файла с определениями
const tileDefinitions = require('../data/tileDefinitions');

/**
 * Функция для получения сегментов грани плитки.
 * Принимает тип плитки и индекс грани (0, 1, 2 или 3).
 * Возвращает массив сегментов для заданной грани или пустой массив,
 * если сегменты не найдены.
 * 
 * @param {string} tileType - тип плитки, например, "photo1" или "castlewithenter"
 * @param {number} edgeIndex - индекс грани (0 – север, 1 – восток, 2 – юг, 3 – запад)
 * @returns {Array} массив сегментов или пустой массив
 */
function getEdgeSegments(tileType, edgeIndex) {
  const tileDefinition = tileDefinitions[tileType];
  if (!tileDefinition || !tileDefinition.edges) return [];
  const edge = tileDefinition.edges.find(e => e.edge === edgeIndex);
  return edge && edge.segments ? edge.segments : [];
}

/**
 * (Опционально) Если у вас есть другие вспомогательные функции для работы с областями, 
 * вы можете добавить их сюда и экспортировать.
 */

// Для примера добавим функцию findAreaByName для бэкенда:
const tileAreas = {};
// Пройти по каждому типу плитки и сохранить области без полигонов (если нужно для бэкенда)
Object.keys(tileDefinitions).forEach(tileType => {
  if (tileDefinitions[tileType].areas) {
    tileAreas[tileType] = tileDefinitions[tileType].areas.map(area => ({
      name: area.name,
      type: area.type
    }));
  }
});

function findAreaByName(tileType, areaName) {
  const areas = tileAreas[tileType];
  if (!areas) return null;
  return areas.find(area => area.name === areaName) || null;
}

module.exports = {
  getEdgeSegments,
  findAreaByName,
  tileAreas  // если нужно экспортировать для других функций
};
