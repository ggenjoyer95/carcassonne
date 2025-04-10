import { render, screen } from "@testing-library/react";
import TileComponent from "../components/TileComponent";

test("TileComponent renders without warnings", () => {
  const testTile = {
    image: "CastleCenter0.png",
    rotation: 0,
    type: "CastleCenter0",
    active: true,
  };

  render(
    <TileComponent tile={testTile} tileSize={100} onAreaClick={() => {}} />
  );

  const imgElement = screen.getByAltText(/tile/i);
  expect(imgElement).toBeInTheDocument();
});
