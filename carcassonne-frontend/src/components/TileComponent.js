import React from "react";
import TileOverlay from "./TileOverlay";
import Meeple from "./Meeple";
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
          <Meeple
            type={tile.meeple.meepleType}
            color={tile.meeple.color}
            size={25}
            style={{
              position: "absolute",
              left: meeplePosition.x - 13, // при необходимости корректировать смещение
              top: meeplePosition.y - 12,
            }}
          />
        )}   
    </div>
  );
}

export default TileComponent;
