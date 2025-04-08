// carcassonne-server/helpers/featureScoring.js

const { getEffectiveEdgeIndices } = require('./matchRules');
const { getEdgeSegments, findSegmentByIndex } = require('./tileSegments');

// Направления обхода: для каждой стороны тайла (индексы: 0 – top, 1 – right, 2 – bottom, 3 – left)
// для текущего тайла проверяем соседний тайл в данном направлении. Если сосед отсутствует
// или его соответствующая сторона не совпадает с нужным типом, увеличиваем счетчик открытых краёв.
const directions = [
  { dx: 0, dy: -1, sideIndex: 0, oppositeIndex: 2 }, // верх (north)
  { dx: 1, dy: 0, sideIndex: 1, oppositeIndex: 3 },   // правый (east)
  { dx: 0, dy: 1, sideIndex: 2, oppositeIndex: 0 },   // нижний (south)
  { dx: -1, dy: 0, sideIndex: 3, oppositeIndex: 1 }   // левый (west)
];

/**
 * Функция выполняет обход (DFS) для сбора всех тайлов, входящих в один регион (feature).
 * @param {Object} board - объект игрового поля (ключи: "x,y")
 * @param {number} startX - координата x начального тайла
 * @param {number} startY - координата y начального тайла
 * @param {string} featureType - тип объекта ("road" или "castle" и т.п.)
 * @param {string} connectivityGroup - группа связности (например, "R1" или "C1")
 * @returns {Object} feature - объект с собранными данными:
 *   { type, group, tiles: Set([...]), meeples: { [playerId]: count, ... }, openEdges }
 */
function gatherFeature(board, startX, startY, featureType, connectivityGroup) {
  const visited = new Set();
  const tilesInFeature = new Set();
  let openEdges = 0;
  const meepleCounts = {};

  // Для удобства, определим функцию DFS по тайлам.
  function dfs(x, y) {
    const key = `${x},${y}`;
    if (visited.has(key)) return;
    visited.add(key);
    const tile = board[key];
    if (!tile) return;
    
    // Добавляем тайл в регион.
    tilesInFeature.add(key);
    
    // Если на этом тайле установлен мипл, и его segmentType совпадает с featureType, учитываем его.
    if (tile.meeple && tile.meeple.segmentType === featureType) {
      const pid = tile.owner;
      meepleCounts[pid] = (meepleCounts[pid] || 0) + 1;
    }
    
    // Получаем эффективные индексы граней с учетом поворота
    const effectiveEdgeIndices = getEffectiveEdgeIndices(tile);
    
    // Для каждого направления проверяем соседа
    directions.forEach(({ dx, dy, sideIndex, oppositeIndex }) => {
      // Получаем реальный индекс грани с учетом поворота
      const edgeIndex = effectiveEdgeIndices[sideIndex];
      
      // Получаем сегменты грани
      const segments = getEdgeSegments(tile.type, edgeIndex);
      
      // Проверяем, есть ли среди сегментов грани сегмент с нужным типом и группой связности
      const matchingSegment = segments.find(segment =>
        segment.area === featureType && segment.group === connectivityGroup
      );
      
      if (matchingSegment) {
        const neighborKey = `${x + dx},${y + dy}`;
        const neighbor = board[neighborKey];
        
        if (!neighbor) {
          // Нет соседа – открытый край.
          openEdges++;
        } else {
          // Получаем эффективные индексы граней соседа с учетом поворота
          const neighborEffectiveIndices = getEffectiveEdgeIndices(neighbor);
          const neighborEdgeIndex = neighborEffectiveIndices[oppositeIndex];
          
          // Получаем сегменты грани соседа
          const neighborSegments = getEdgeSegments(neighbor.type, neighborEdgeIndex);
          
          // Проверяем, есть ли среди сегментов грани соседа сегмент с нужным типом и группой связности
          // Учитываем, что сегменты соседа нужно проверять в обратном порядке
          const neighborSegmentIndex = segments.length - 1 - matchingSegment.index;
          const neighborMatchingSegment = neighborSegments.find(segment =>
            segment.index === neighborSegmentIndex &&
            segment.area === featureType
          );
          
          if (neighborMatchingSegment) {
            // Сторона соседа совпадает – продолжаем обход, независимо от того, был ли он уже посещен.
            dfs(x + dx, y + dy);
          } else {
            // Сосед есть, но его сторона не совпадает – край открыт.
            openEdges++;
          }
        }
      }
    });
  }

  dfs(startX, startY);
  return {
    type: featureType,
    group: connectivityGroup,
    tiles: tilesInFeature,
    meeples: meepleCounts,
    openEdges: openEdges
  };
}

/**
 * Функция рассчитывает очки для данного региона (feature) по следующим правилам:
 * - Для дороги: 1 очко за каждый тайл.
 * - Для города: если завершён (openEdges===0) – 2 очка за тайл, иначе 1 очко за тайл.
 * (Монастырь и поля можно добавить аналогично.)
 * Если регион не завершён (openEdges > 0), очки не начисляются.
 * Также применяется правило большинства миплов: очки получает игрок (или все при ничьей) с максимальным числом миплов.
 *
 * @param {Object} feature - объект, возвращённый gatherFeature.
 * @returns {Object} - { points, winners }.
 */
function scoreFeature(feature) {
  // Если регион не завершён, очки не начисляем.
  if (feature.openEdges !== 0) return { points: 0, winners: [] };

  const tileCount = feature.tiles.size;
  let basePoints = 0;
  if (feature.type === "road") {
    basePoints = 1;
  } else if (feature.type === "castle") {
    basePoints = 2;
  } else {
    // Для других типов можно расширять
    basePoints = 1;
  }
  const totalPoints = basePoints * tileCount;

  // Определяем, кто имеет максимальное число миплов в этом регионе.
  let maxCount = 0;
  for (const count of Object.values(feature.meeples)) {
    if (count > maxCount) maxCount = count;
  }
  const winners = [];
  for (const [pid, count] of Object.entries(feature.meeples)) {
    if (count === maxCount) winners.push(pid);
  }
  return { points: totalPoints, winners };
}

/**
 * Основная функция подсчета очков по игровому полю.
 * Она проходит по всем тайлам с установленными миплами, запускает DFS для каждого региона,
 * если регион еще не обработан, и, если регион завершен (openEdges===0), начисляет очки победителям.
 *
 * @param {Object} game - объект игры, содержащий board и список игроков.
 * @returns {Object} scores - { [playerId]: score, ... }
 */
function calculateScores(game) {
  const board = game.board;
  const processed = new Set();
  const scores = {};
  game.players.forEach(player => {
    scores[player.playerId] = 0;
  });

  // Проходим по всем тайлам.
  Object.entries(board).forEach(([key, tile]) => {
    if (tile && tile.meeple) {
      if (processed.has(key)) return; // уже обработан в рамках какого-либо региона
      
      // Определяем тип фичи и группу связности по установленному миплу
      const featureType = tile.meeple.segmentType; // например, "road" или "castle"
      const segmentName = tile.meeple.segment; // имя сегмента, например "roadArea" или "castle"
      
      // Получаем эффективные индексы граней с учетом поворота
      const effectiveEdgeIndices = getEffectiveEdgeIndices(tile);
      
      // Ищем сегмент с указанным именем среди всех граней
      let connectivityGroup = null;
      for (let i = 0; i < 4; i++) {
        const edgeIndex = effectiveEdgeIndices[i];
        const segments = getEdgeSegments(tile.type, edgeIndex);
        
        for (const segment of segments) {
          if (segment.area === segmentName) {
            connectivityGroup = segment.group;
            break;
          }
        }
        
        if (connectivityGroup) break;
      }
      
      if (!connectivityGroup) {
        console.warn(`Не удалось найти группу связности для мипла на плитке ${key}`);
        return;
      }
      
      // Запускаем DFS, начиная с этого тайла.
      const [xStr, yStr] = key.split(",");
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      const feature = gatherFeature(board, x, y, featureType, connectivityGroup);
      
      // Если регион завершен (openEdges === 0), начисляем очки.
      if (feature.openEdges === 0) {
        const result = scoreFeature(feature);
        result.winners.forEach(pid => {
          scores[pid] += result.points;
        });
      }
      
      // Отмечаем все тайлы региона как обработанные.
      feature.tiles.forEach(tKey => processed.add(tKey));
    }
  });
  
  console.log("Текущий счет:", scores);
  return scores;
}

/**
 * Функция для подсчета очков за поля, прилегающие к завершенным городам
 * @param {Object} game - объект игры
 * @returns {Object} - { [playerId]: score, ... }
 */
function calculateFieldScores(game) {
  const board = game.board;
  const fieldScores = {};
  game.players.forEach(player => {
    fieldScores[player.playerId] = 0;
  });
  
  // Сначала находим все завершенные города
  const completedCities = [];
  const processedCities = new Set();
  
  Object.entries(board).forEach(([key, tile]) => {
    if (!tile) return;
    
    const [xStr, yStr] = key.split(",");
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);
    
    // Получаем эффективные индексы граней с учетом поворота
    const effectiveEdgeIndices = getEffectiveEdgeIndices(tile);
    
    // Проверяем каждую грань
    for (let i = 0; i < 4; i++) {
      const edgeIndex = effectiveEdgeIndices[i];
      const segments = getEdgeSegments(tile.type, edgeIndex);
      
      // Ищем сегменты типа "castle"
      for (const segment of segments) {
        if (segment.area === "castle" && !processedCities.has(`${key}-${segment.group}`)) {
          // Собираем город
          const city = gatherFeature(board, x, y, "castle", segment.group);
          
          // Если город завершен, добавляем его в список
          if (city.openEdges === 0) {
            completedCities.push(city);
          }
          
          // Отмечаем город как обработанный
          city.tiles.forEach(tileKey => {
            processedCities.add(`${tileKey}-${segment.group}`);
          });
        }
      }
    }
  });
  
  // Теперь находим все поля, прилегающие к завершенным городам
  const processedFields = new Set();
  
  // Для каждого завершенного города
  completedCities.forEach(city => {
    // Для каждой плитки в городе
    city.tiles.forEach(tileKey => {
      const [xStr, yStr] = tileKey.split(",");
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      const tile = board[tileKey];
      
      // Получаем эффективные индексы граней с учетом поворота
      const effectiveEdgeIndices = getEffectiveEdgeIndices(tile);
      
      // Проверяем каждую грань
      for (let i = 0; i < 4; i++) {
        const edgeIndex = effectiveEdgeIndices[i];
        const segments = getEdgeSegments(tile.type, edgeIndex);
        
        // Ищем сегменты типа "field", прилегающие к городу
        for (const segment of segments) {
          if (segment.area === "field" && !processedFields.has(`${tileKey}-${segment.group}`)) {
            // Собираем поле
            const field = gatherFeature(board, x, y, "field", segment.group);
            
            // Подсчитываем очки за поле
            // 3 очка за каждый прилегающий завершенный город
            const points = 3;
            
            // Определяем, кто имеет максимальное число миплов в этом поле
            let maxCount = 0;
            for (const count of Object.values(field.meeples)) {
              if (count > maxCount) maxCount = count;
            }
            
            const winners = [];
            for (const [pid, count] of Object.entries(field.meeples)) {
              if (count === maxCount) winners.push(pid);
            }
            
            // Начисляем очки победителям
            winners.forEach(pid => {
              fieldScores[pid] += points;
            });
            
            // Отмечаем поле как обработанное
            field.tiles.forEach(fieldTileKey => {
              processedFields.add(`${fieldTileKey}-${segment.group}`);
            });
          }
        }
      }
    });
  });
  
  console.log("Очки за поля:", fieldScores);
  return fieldScores;
}

module.exports = {
  gatherFeature,
  scoreFeature,
  calculateScores,
  calculateFieldScores
};
