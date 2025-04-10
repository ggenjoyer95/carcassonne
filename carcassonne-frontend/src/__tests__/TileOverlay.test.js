import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TileOverlay from "../components/TileOverlay";

jest.mock("../data/tileAreas", () => ({
  tileAreas: {
    testTile: {
      areas: [
        {
          name: "TestArea",
          polygon: [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
        },
      ],
    },
  },
}));

describe("TileOverlay component", () => {
  const tile = { type: "testTile", rotation: 0 };
  const tileSize = 100;
  const onAreaClick = jest.fn();

  test("renders polygon based on tileAreas definition", () => {
    const { container } = render(
      <TileOverlay tile={tile} tileSize={tileSize} onAreaClick={onAreaClick} />
    );

    const polygon = container.querySelector("polygon");
    expect(polygon).toBeInTheDocument();
    expect(polygon.getAttribute("points")).toBe("0,0 100,0 100,100 0,100");
  });

  test("changes polygon fill on mouse enter and leave", () => {
    const { container } = render(
      <TileOverlay tile={tile} tileSize={tileSize} onAreaClick={onAreaClick} />
    );
    const polygon = container.querySelector("polygon");

    expect(polygon.getAttribute("fill")).toBe("rgba(0,0,0,0)");

    fireEvent.mouseEnter(polygon);
    expect(polygon.getAttribute("fill")).toBe("rgba(255,255,0,0.4)");

    fireEvent.mouseLeave(polygon);
    expect(polygon.getAttribute("fill")).toBe("rgba(0,0,0,0)");
  });
});
