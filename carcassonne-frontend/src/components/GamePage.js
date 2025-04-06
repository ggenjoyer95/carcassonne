import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CarcassonneMap from "./CarcassonneMap";

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState("");
  const [scale, setScale] = useState(1);
  const token = localStorage.getItem("jwt");

  let playerId = "";
  try {
    const decoded = jwtDecode(token);
    playerId = decoded.playerId;
  } catch (err) {
    console.error("Ошибка декодирования токена", err);
  }

  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      } else {
        console.error("Ошибка при получении состояния игры");
      }
    } catch (err) {
      console.error("Ошибка соединения с сервером:", err);
    }
  }, [gameId, token]);

  useEffect(() => {
    fetchGameState();
    const intervalId = setInterval(fetchGameState, 2000);
    return () => clearInterval(intervalId);
  }, [fetchGameState]);

  useEffect(() => {
    if (gameState && gameState.status === "finished") {
      navigate("/finish");
    }
  }, [gameState, navigate]);
  const handlePlaceTile = async (x, y, offsetX, offsetY) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/placeTile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ x, y, offsetX, offsetY }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || "Ошибка при установке изображения");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером.");
    }
  };

  const handlePlaceMeeple = async (x, y, areaName) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/placeMeeple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ x, y, areaName }), // передаем имя области
        }
      );
      if (response.ok) {
        const data = await response.json();
        setGameState(data);  // обновляем состояние игры
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || "Ошибка при установке мипла");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером.");
    }
  };

  const handleEndTurn = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/endTurn`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || "Ошибка при завершении хода");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером.");
    }
  };

  const handleRotateImage = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/rotateImage`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || "Ошибка при повороте изображения");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером.");
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => prev + 0.1);
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  if (!gameState) return <div>Загрузка состояния игры...</div>;

  const isMyTurn = gameState.currentTurn === playerId;
  const tilePlacedThisTurn = gameState.currentMoveMade;
  const myPlayer = gameState.players.find((p) => p.playerId === playerId);
  const myColor = myPlayer ? myPlayer.color : null;
  const myId = playerId;

  return (
    <div style={{ textAlign: "center", padding: "20px", position: "relative" }}>
      <h2>Игра {gameId}</h2>
      <p>
        Текущий ход:{" "}
        {
          gameState.players.find((p) => p.playerId === gameState.currentTurn)
            ?.name
        }
      </p>
      {/* Подсчет оставшихся ходов */}
      <p>Осталось {gameState.remainingCards} карт</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Контейнер для игрового поля и панели масштабирования */}
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <div
          style={{
            width: "100%",
            height: "600px",
            overflow: "auto",
            border: "1px solid #ccc",
            margin: "0 auto",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Внутренний контейнер с масштабированием */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <CarcassonneMap
              board={gameState.board}
              onPlaceTile={handlePlaceTile}
              onPlaceMeeple={handlePlaceMeeple}
              isCurrentTurn={isMyTurn}
              myColor={myColor}
              myId={myId}
            />
          </div>
        </div>

        {/* Панель с кнопками масштабирования справа от игрового поля */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingTop: "20px",
          }}
        >
          <button
            onClick={handleZoomIn}
            style={{ padding: "10px 20px", fontSize: "14px" }}
          >
            Приблизить
          </button>
          <button
            onClick={handleZoomOut}
            style={{ padding: "10px 20px", fontSize: "14px" }}
          >
            Отдалить
          </button>
        </div>
      </div>

      {/* Блок с кнопками управления ходом, поворотом и нижним изображением */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={handleRotateImage}
            disabled={!isMyTurn}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: !isMyTurn ? "not-allowed" : "pointer",
            }}
          >
            Повернуть
          </button>
          <button
            onClick={handleEndTurn}
            disabled={!isMyTurn || !tilePlacedThisTurn}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor:
                !isMyTurn || !tilePlacedThisTurn ? "not-allowed" : "pointer",
            }}
          >
            Сделать ход
          </button>
        </div>

        <div>
          <img
            src={`/${gameState.currentTileImage}`}
            alt="Текущее изображение для плиток"
            style={{
              maxWidth: "200px",
              width: "100%",
              height: "auto",
              transform: `rotate(${gameState.imageRotation}deg)`,
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default GamePage;
