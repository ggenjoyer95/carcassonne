import React, { useState } from "react";
import { tileAreas } from "../data/tileAreas";

function TileOverlay({ tile, tileSize, onAreaClick }) {
  const areas = tileAreas[tile.type] || [];
  const [hoveredArea, setHoveredArea] = useState(null);

  // Функция, которая получает координаты клика в системе координат SVG
  const getSVGCoordinates = (e) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  return (
  <svg
    width={tileSize}
    height={tileSize}
    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "all" }}
  >
    <g transform={`rotate(${tile.rotation}, ${tileSize / 2}, ${tileSize / 2})`}>
      {areas.map((area) => {
        const points = area.polygon
          .map(([x, y]) => `${x * tileSize},${y * tileSize}`)
          .join(" ");
        const isHovered = hoveredArea === area.name;
        return (
          <polygon
            key={area.name}
            points={points}
            fill={isHovered ? "rgba(255,255,0,0.4)" : "rgba(0,0,0,0)"}
            stroke="rgba(255,255,0,0.5)"
            strokeWidth="1"
            onMouseEnter={() => setHoveredArea(area.name)}
            onMouseLeave={() => setHoveredArea(null)}
            onClick={(e) => {
              e.stopPropagation();
              const coords = getSVGCoordinates(e);
              onAreaClick(area.name, coords.x, coords.y);
            }}
          />
        );
      })}
    </g>
  </svg>
);

}

export default TileOverlay;
