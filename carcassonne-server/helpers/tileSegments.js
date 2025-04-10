const tileDefinitions = require("../data/tileDefinitions");

function getEdgeSegments(tileType, edgeIndex) {
  const tileDefinition = tileDefinitions[tileType];
  if (!tileDefinition || !tileDefinition.edges) return [];
  const edge = tileDefinition.edges.find((e) => e.edge === edgeIndex);
  return edge && edge.segments ? edge.segments : [];
}

const tileAreas = {};
Object.keys(tileDefinitions).forEach((tileType) => {
  if (tileDefinitions[tileType].areas) {
    tileAreas[tileType] = tileDefinitions[tileType].areas.map((area) => ({
      name: area.name,
      type: area.type,
    }));
  }
});

function findAreaByName(tileType, areaName) {
  const areas = tileAreas[tileType];
  if (!areas) return null;
  return areas.find((area) => area.name === areaName) || null;
}

module.exports = {
  getEdgeSegments,
  findAreaByName,
  tileAreas,
};
