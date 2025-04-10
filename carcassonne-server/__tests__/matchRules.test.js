const {
  AREA_TYPES,
  getEffectiveEdgeIndices,
  getEffectiveEdges,
  canMatchSegments,
  canMatch,
  validateTilePlacement,
} = require("../helpers/matchRules");

jest.mock("../helpers/tileSegments", () => ({
  getEdgeSegments: (tileType, edgeIndex) => {
    if (tileType === "A") {
      return [{ area: "castle" }];
    } else if (tileType === "B") {
      return [{ area: "road" }];
    }
    return [];
  },
}));

describe("matchRules helpers", () => {
  describe("getEffectiveEdgeIndices", () => {
    test("returns correct indices for rotation 0", () => {
      expect(getEffectiveEdgeIndices({ rotation: 0 })).toEqual([0, 1, 2, 3]);
    });

    test("returns correct indices for rotation 90", () => {
      expect(getEffectiveEdgeIndices({ rotation: 90 })).toEqual([3, 0, 1, 2]);
    });

    test("returns correct indices for rotation 180", () => {
      expect(getEffectiveEdgeIndices({ rotation: 180 })).toEqual([2, 3, 0, 1]);
    });

    test("returns correct indices for rotation 270", () => {
      expect(getEffectiveEdgeIndices({ rotation: 270 })).toEqual([1, 2, 3, 0]);
    });

    test("handles rotations greater than 360", () => {
      expect(getEffectiveEdgeIndices({ rotation: 450 })).toEqual([3, 0, 1, 2]);
    });
  });

  describe("canMatchSegments", () => {
    test("returns true for matching segments", () => {
      const seg1 = [{ area: "castle" }];
      const seg2 = [{ area: "castle" }];
      expect(canMatchSegments(seg1, seg2)).toBe(true);
    });

    test("returns false if number of segments differs", () => {
      const seg1 = [{ area: "castle" }, { area: "road" }];
      const seg2 = [{ area: "castle" }];
      expect(canMatchSegments(seg1, seg2)).toBe(false);
    });

    test("returns false for non-matching segment values", () => {
      const seg1 = [{ area: "castle" }];
      const seg2 = [{ area: "road" }];
      expect(canMatchSegments(seg1, seg2)).toBe(false);
    });

    test("compares segments in reverse order", () => {
      const seg1 = [{ area: "castle" }, { area: "road" }];
      const seg2 = [{ area: "road" }, { area: "castle" }];
      expect(canMatchSegments(seg1, seg2)).toBe(true);
    });
  });

  describe("validateTilePlacement", () => {
    test("returns false if there are no neighbors (move not allowed)", () => {
      const board = {};
      const tile = { rotation: 0, type: "A" };
      expect(validateTilePlacement(board, tile, 0, 0)).toBe(false);
    });

    test("returns true for valid neighbor matching", () => {
      const board = {
        "0,-1": { rotation: 0, type: "A" },
      };
      const tile = { rotation: 0, type: "A" };
      expect(validateTilePlacement(board, tile, 0, 0)).toBe(true);
    });

    test("returns false if neighbor segments do not match", () => {
      const board = {
        "0,-1": { rotation: 0, type: "B" },
      };
      const tile = { rotation: 0, type: "A" };
      expect(validateTilePlacement(board, tile, 0, 0)).toBe(false);
    });
  });

  describe("getEffectiveEdges", () => {
    test("returns an array of edge types (areas) for compatibility", () => {
      const tile = { rotation: 0, type: "A" };
      expect(getEffectiveEdges(tile)).toEqual([
        "castle",
        "castle",
        "castle",
        "castle",
      ]);
    });
  });

  describe("canMatch", () => {
    test("returns true when edges are the same", () => {
      expect(canMatch("castle", "castle")).toBe(true);
    });
    test("returns false when edges differ", () => {
      expect(canMatch("castle", "road")).toBe(false);
    });
  });
});
