import React from "react";
import TileComponent from "./TileComponent";

const CarcassonneMap = ({
  board,
  onPlaceTile,
  onPlaceMeeple,  // функция установки мипла
  isCurrentTurn,
  myColor,
  myId,
}) => {
  const tileSize = 80;
  const keys = Object.keys(board);
  if (keys.length === 0) return null;

  const xs = keys.map((key) => parseInt(key.split(",")[0], 10));
  const ys = keys.map((key) => parseInt(key.split(",")[1], 10));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const numCols = maxX - minX + 1;
  const numRows = maxY - minY + 1;

  const cells = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const key = `${x},${y}`;
      const cell = board.hasOwnProperty(key) ? board[key] : undefined;
      cells.push({ x, y, key, cell });
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${numCols}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${numRows}, ${tileSize}px)`,
        gap: "5px",
        justifyContent: "center",
        marginTop: "20px",
      }}
    >
      {cells.map(({ x, y, key, cell }) => (
        <div
          key={key}
          style={{
            border: "1px solid black",
            backgroundColor: cell ? "#ddd" : "#f0f0f0",
            width: `${tileSize}px`,
            height: `${tileSize}px`,
            position: "relative",
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            if (!cell && isCurrentTurn) {
              onPlaceTile(x, y, offsetX, offsetY);
            }
          }}
        >
          {cell && cell.tile === "image" && (
            <TileComponent
              tile={{ ...cell, x, y }}
              tileSize={tileSize}
              onAreaClick={(areaName) => {
                // Выводим в консоль информацию о зоне
                console.log(
                  `Зона ${areaName} была выбрана на тайле (${x},${y})`
                );
                if (isCurrentTurn) {
                  onPlaceMeeple(x, y, areaName);
                }
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CarcassonneMap;
