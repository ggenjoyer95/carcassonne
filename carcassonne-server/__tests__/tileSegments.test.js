const { getEdgeSegments } = require("../helpers/tileSegments");

describe("getEdgeSegments function", () => {
  it("returns segments for a given tile type and edge index", () => {
    const result = getEdgeSegments("CastleCenter0", 0);
    expect(Array.isArray(result)).toBe(true);
  });
});
