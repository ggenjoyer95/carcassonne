import React from "react";
import TileOverlay from "./TileOverlay";
import Meeple from "./Meeple";

function TileComponent({ tile, tileSize, onAreaClick }) {
  return (
    <div style={{ position: "relative", width: tileSize, height: tileSize }}>
      <img
        src={`/tiles/${tile.image}`}
        alt="Tile"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: tileSize,
          height: tileSize,
          objectFit: "cover",
          transform: `rotate(${tile.rotation}deg)`,
          filter: tile.image === "castlewithenter.png" ? "contrast(1.4) brightness(0.7)" : "none"
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
            left: tile.meeple.offsetX - 9, // корректировка смещения
            top: tile.meeple.offsetY - 11,
          }}
        />
      )}
    </div>
  );
}

export default TileComponent;
