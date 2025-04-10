const tileDefinitionsData = require("../data/tileDefinitions");
const { getEdgeSegments } = require("./tileSegments");

const AREA_TYPES = {
  CASTLE: "castle",
  ROAD: "road",
  FIELD: "field",
};

function getEffectiveEdgeIndices(tile) {
  const rotations = (((tile.rotation % 360) + 360) % 360) / 90;

  let effectiveIndices = [0, 1, 2, 3];

  for (let i = 0; i < rotations; i++) {
    effectiveIndices.unshift(effectiveIndices.pop());
  }

  return effectiveIndices;
}

function canMatchSegments(segments1, segments2) {
  if (segments1.length !== segments2.length) return false;

  for (let i = 0; i < segments1.length; i++) {
    const segment1 = segments1[i];
    const segment2 = segments2[segments2.length - 1 - i];

    if (segment1.area !== segment2.area) return false;
  }

  return true;
}

function validateTilePlacement(board, tile, x, y) {
  const effectiveEdgeIndices = getEffectiveEdgeIndices(tile);
  let hasNeighbor = false;

  const directions = [
    { dx: 0, dy: -1, edgeIndex: 0, oppositeIndex: 2 },
    { dx: 1, dy: 0, edgeIndex: 1, oppositeIndex: 3 },
    { dx: 0, dy: 1, edgeIndex: 2, oppositeIndex: 0 },
    { dx: -1, dy: 0, edgeIndex: 3, oppositeIndex: 1 },
  ];

  for (const { dx, dy, edgeIndex, oppositeIndex } of directions) {
    const neighborKey = `${x + dx},${y + dy}`;
    const neighbor = board[neighborKey];

    if (neighbor !== undefined && neighbor !== null) {
      hasNeighbor = true;

      const tileEdgeIndex = effectiveEdgeIndices[edgeIndex];
      const neighborEffectiveIndices = getEffectiveEdgeIndices(neighbor);
      const neighborEdgeIndex = neighborEffectiveIndices[oppositeIndex];

      const tileSegments = getEdgeSegments(tile.type, tileEdgeIndex);
      const neighborSegments = getEdgeSegments(
        neighbor.type,
        neighborEdgeIndex
      );

      if (!canMatchSegments(tileSegments, neighborSegments)) {
        return false;
      }
    }
  }

  return hasNeighbor;
}

function getEffectiveEdges(tile) {
  const effectiveIndices = getEffectiveEdgeIndices(tile);

  return effectiveIndices.map((index) => {
    const segments = getEdgeSegments(tile.type, index);
    return segments.length === 1 ? segments[0].area : segments[0].area;
  });
}

function canMatch(edge1, edge2) {
  return edge1 === edge2;
}

module.exports = {
  AREA_TYPES,
  getEffectiveEdgeIndices,
  getEffectiveEdges,
  canMatchSegments,
  canMatch,
  validateTilePlacement,
};
