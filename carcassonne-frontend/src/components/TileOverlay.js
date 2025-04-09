import React, { useState } from "react";
import { tileAreas } from "../data/tileAreas";

function TileOverlay({ tile, tileSize, onAreaClick }) {
  // Определяем, что такое areas – проверяем, является ли tileAreas[tile.type] массивом или объектом с массивом в поле "areas"
  const definition = tileAreas[tile.type];
  let areas = [];
  if (Array.isArray(definition)) {
    // Если для плитки определение возвращено как массив, используем его напрямую
    areas = definition;
  } else if (definition && Array.isArray(definition.areas)) {
    // Если определение – объект с полем areas
    areas = definition.areas;
  } else {
    console.warn(`Для плитки типа "${tile.type}" не найдено корректное определение областей.`);
  }

  const [hoveredArea, setHoveredArea] = useState(null);

  // Функция для получения координат клика в системе координат SVG
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
