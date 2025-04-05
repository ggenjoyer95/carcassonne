import React from "react";
import TileOverlay from "./TileOverlay";
import { calculateMeeplePosition } from "../data/tileAreas";

function TileComponent({ tile, tileSize, onAreaClick }) {
  // Рассчитываем позицию мипла, если он существует
  let meeplePosition = { x: 0, y: 0 };
  if (tile.meeple) {
    meeplePosition = calculateMeeplePosition(
      tile.meeple.segment,
      tile.type,
      tileSize,
      tile.rotation
    );
  }
  return (
    <div style={{ position: "relative", width: tileSize, height: tileSize }}>
      <img
        src={`/${tile.image}`}
        alt="Tile"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: tileSize,
          height: tileSize,
          objectFit: "cover",
          transform: `rotate(${tile.rotation}deg)`,
        }}
      />
      {tile.active && (
        <TileOverlay tile={tile} tileSize={tileSize} onAreaClick={onAreaClick} />
      )}
      {tile.meeple && (
        <div
          style={{
            position: "absolute",
            left: meeplePosition.x - 7.5,
            top: meeplePosition.y - 7.5,
            width: "15px",
            height: "15px",
            borderRadius: "50%",
            backgroundColor: tile.meeple.color,
            border: "1px solid white",
          }}
        />
      )}
    </div>
  );
}

export default TileComponent;
