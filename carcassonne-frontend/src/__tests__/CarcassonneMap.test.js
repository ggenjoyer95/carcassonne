import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CarcassonneMap from "../components/CarcassonneMap";
import { MemoryRouter } from "react-router-dom";

jest.mock("../components/TileComponent", () => {
  return (props) => {
    return <div data-testid="tile-component">{props.tile.image}</div>;
  };
});

describe("CarcassonneMap component", () => {
  const tileSize = 80;
  const sampleOnPlaceTile = jest.fn();
  const sampleOnPlaceMeeple = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns null when board is empty", () => {
    const { container } = render(
      <MemoryRouter>
        <CarcassonneMap
          board={{}}
          onPlaceTile={sampleOnPlaceTile}
          onPlaceMeeple={sampleOnPlaceMeeple}
          isCurrentTurn={true}
          myColor="red"
          myId="player1"
        />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders grid cells correctly", () => {
    const board = {
      "0,0": undefined,
      "1,0": undefined,
      "0,1": undefined,
      "1,1": {
        tile: "image",
        image: "test-tile.png",
        rotation: 0,
        type: "TestTile",
      },
    };

    const { container } = render(
      <MemoryRouter>
        <CarcassonneMap
          board={board}
          onPlaceTile={sampleOnPlaceTile}
          onPlaceMeeple={sampleOnPlaceMeeple}
          isCurrentTurn={true}
          myColor="blue"
          myId="player1"
        />
      </MemoryRouter>
    );

    const gridCells = container.querySelectorAll(
      "div[style*='border: 1px solid black']"
    );
    expect(gridCells.length).toBe(4);
  });

  test("calls onPlaceTile when clicking on an empty cell and isCurrentTurn is true", () => {
    const board = {
      "0,0": undefined,
    };

    const { container } = render(
      <MemoryRouter>
        <CarcassonneMap
          board={board}
          onPlaceTile={sampleOnPlaceTile}
          onPlaceMeeple={sampleOnPlaceMeeple}
          isCurrentTurn={true}
          myColor="green"
          myId="player1"
        />
      </MemoryRouter>
    );

    const cell = container.querySelector(
      "div[style*='border: 1px solid black']"
    );
    cell.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: tileSize,
      height: tileSize,
      right: tileSize,
      bottom: tileSize,
    });

    fireEvent.click(cell, { clientX: 40, clientY: 40 });
    expect(sampleOnPlaceTile).toHaveBeenCalledWith(0, 0, 40, 40);
  });

  test("does not call onPlaceTile when isCurrentTurn is false", () => {
    const board = {
      "0,0": undefined,
    };

    const { container } = render(
      <MemoryRouter>
        <CarcassonneMap
          board={board}
          onPlaceTile={sampleOnPlaceTile}
          onPlaceMeeple={sampleOnPlaceMeeple}
          isCurrentTurn={false}
          myColor="green"
          myId="player1"
        />
      </MemoryRouter>
    );

    const cell = container.querySelector(
      "div[style*='border: 1px solid black']"
    );
    cell.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: tileSize,
      height: tileSize,
      right: tileSize,
      bottom: tileSize,
    });

    fireEvent.click(cell, { clientX: 40, clientY: 40 });
    expect(sampleOnPlaceTile).not.toHaveBeenCalled();
  });

  test("renders TileComponent when a tile exists in the board", () => {
    const board = {
      "1,1": {
        tile: "image",
        image: "test-tile.png",
        rotation: 0,
        type: "TestTile",
      },
    };

    render(
      <MemoryRouter>
        <CarcassonneMap
          board={board}
          onPlaceTile={sampleOnPlaceTile}
          onPlaceMeeple={sampleOnPlaceMeeple}
          isCurrentTurn={true}
          myColor="purple"
          myId="player1"
        />
      </MemoryRouter>
    );
    const tileComponent = screen.getByTestId("tile-component");
    expect(tileComponent).toBeInTheDocument();
    expect(tileComponent).toHaveTextContent("test-tile.png");
  });
});
