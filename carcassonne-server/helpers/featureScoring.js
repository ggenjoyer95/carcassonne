const { getEffectiveEdges } = require("./matchRules");

const directions = [
  { dx: 0, dy: -1, sideIndex: 0, oppositeIndex: 2 },
  { dx: 1, dy: 0, sideIndex: 1, oppositeIndex: 3 },
  { dx: 0, dy: 1, sideIndex: 2, oppositeIndex: 0 },
  { dx: -1, dy: 0, sideIndex: 3, oppositeIndex: 1 },
];

function gatherFeature(board, startX, startY, featureType) {
  const visited = new Set();
  const tilesInFeature = new Set();
  let openEdges = 0;
  const meepleCounts = {};

  function dfs(x, y) {
    const key = `${x},${y}`;
    if (visited.has(key)) return;
    visited.add(key);
    const tile = board[key];
    if (!tile) return;
    tilesInFeature.add(key);
    if (tile.meeple && tile.meeple.segmentType === featureType) {
      const pid = tile.owner;
      meepleCounts[pid] = (meepleCounts[pid] || 0) + 1;
    }
    const edges = getEffectiveEdges(tile);
    directions.forEach(({ dx, dy, sideIndex, oppositeIndex }) => {
      if (edges[sideIndex] === featureType) {
        const neighborKey = `${x + dx},${y + dy}`;
        const neighbor = board[neighborKey];
        if (!neighbor) {
          openEdges++;
        } else {
          const neighborEdges = getEffectiveEdges(neighbor);
          if (neighborEdges[oppositeIndex] === featureType) {
            dfs(x + dx, y + dy);
          } else {
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
    openEdges: openEdges,
  };
}

function scoreFeature(feature) {
  if (feature.openEdges !== 0) return { points: 0, winners: [] };

  const tileCount = feature.tiles.size;
  let basePoints = 0;
  if (feature.type === "road") {
    basePoints = 1;
  } else if (feature.type === "city") {
    basePoints = 2;
  } else {
    basePoints = 1;
  }
  const totalPoints = basePoints * tileCount;

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

function calculateScores(game) {
  const board = game.board;
  const processed = new Set();
  const scores = {};
  game.players.forEach((player) => {
    scores[player.playerId] = 0;
  });

  Object.entries(board).forEach(([key, tile]) => {
    if (tile && tile.meeple) {
      if (processed.has(key)) return;
      const featureType = tile.meeple.segmentType;
      const [xStr, yStr] = key.split(",");
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      const feature = gatherFeature(board, x, y, featureType);
      if (feature.openEdges === 0) {
        const result = scoreFeature(feature);
        result.winners.forEach((pid) => {
          scores[pid] += result.points;
        });
      }
      feature.tiles.forEach((tKey) => processed.add(tKey));
    }
  });
  return scores;
}

module.exports = {
  gatherFeature,
  scoreFeature,
  calculateScores,
};
