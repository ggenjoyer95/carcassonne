// carcassonne-server/helpers/featureScoring.js

const { getEffectiveEdges } = require('./matchRules');

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
 * @param {string} featureType - тип объекта ("road" или "city" и т.п.)
 * @returns {Object} feature - объект с собранными данными:
 *   { type, tiles: Set([...]), meeples: { [playerId]: count, ... }, openEdges }
 */
function gatherFeature(board, startX, startY, featureType) {
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
    // Получаем «эффективные» грани тайла с учётом его поворота.
    const edges = getEffectiveEdges(tile);
    // Для каждой стороны, которая имеет тип featureType, проверяем соседа.
    directions.forEach(({ dx, dy, sideIndex, oppositeIndex }) => {
      if (edges[sideIndex] === featureType) {
        const neighborKey = `${x + dx},${y + dy}`;
        const neighbor = board[neighborKey];
        if (!neighbor) {
          // Нет соседа – открытый край.
          openEdges++;
        } else {
          const neighborEdges = getEffectiveEdges(neighbor);
          if (neighborEdges[oppositeIndex] === featureType) {
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
  } else if (feature.type === "city") {
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
      // Определяем тип фичи по установленному миплу.
      const featureType = tile.meeple.segmentType; // например, "road" или "city"
      // Запускаем DFS, начиная с этого тайла.
      const [xStr, yStr] = key.split(",");
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      const feature = gatherFeature(board, x, y, featureType);
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
  //console.log("Текущий счет:", scores);
  return scores;
}

module.exports = {
  gatherFeature,
  scoreFeature,
  calculateScores
};
