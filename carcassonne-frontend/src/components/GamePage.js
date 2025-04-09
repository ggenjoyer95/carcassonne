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
  const [selectedMeepleType, setSelectedMeepleType] = useState("подданные"); // начальное значение

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
      navigate("/finish", { state: gameState });
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

  const handlePlaceMeeple = async (x, y, areaName, relX, relY) => {
    // Проверка количества миплов как раньше...
    const myPlayer = gameState.players.find((p) => p.playerId === playerId);
    const myMeeples = myPlayer ? myPlayer.meeples : 0;
    const myAbbats = myPlayer ? myPlayer.abbats : 0;
    if (selectedMeepleType === "аббаты" && myAbbats <= 0) {
      setError("Нет миплов данного типа");
      return;
    }
    if (selectedMeepleType === "подданные" && myMeeples <= 0) {
      setError("Нет миплов данного типа");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/placeMeeple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ x, y, areaName, meepleType: selectedMeepleType, offsetX: relX, offsetY: relY }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setGameState(data);  // Обновляем состояние игры
        setError("");
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
        setError("");
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
  const handleExit = () => {
    navigate("/");
  };
  
  const handleCancelAction = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/cancelAction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || "Ошибка при отмене действия");
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
  const myMeeples = myPlayer ? myPlayer.meeples : 0;
  const myAbbats = myPlayer ? myPlayer.abbats : 0;
  const myColor = myPlayer ? myPlayer.color : null;
  const myId = playerId;

  return (
    <div style={{ textAlign: "center", padding: "20px", marginTop: "5px" }}>
      <h2 style={{ marginTop: -20 }}>Игра {gameId}</h2>
      <p>
        Текущий ход:{" "}
        {gameState.players.find((p) => p.playerId === gameState.currentTurn)?.name}
      </p>
      {/* Подсчет оставшихся карт */}
      <p>Осталось {gameState.remainingCards} карт</p>
      
      {/* Объединенный блок с ошибками и инструкциями */}
      {(error || isMyTurn) ? (
        <div
          style={{
            margin: "10px auto",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "5px",
            backgroundColor: "rgba(255,0,0,0.1)",
            textAlign: "center",
            width: "50%",
            maxWidth: "50%"
          }}
        >
          {error ? (
            <p style={{ color: "red", margin: "0 0 5px 0" }}>{error}</p>
          ) : null}
          {isMyTurn ? (
            <p style={{ color: "red", margin: 0 }}>
              {tilePlacedThisTurn
                ? "Кликните на установленный квадрат местности, если хотите установить мипл."
                : "Кликните на игровое поле, чтобы установить квадрат местности."}
            </p>
          ) : null}
        </div>
      ) : null}
        
      {/* Контейнер для игрового поля и панели справа */}
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <div
          style={{
            width: "100%",
            maxHeight: "120vh",  // игровая зона будет занимать максимум 80% высоты окна
            overflowY: "auto",  // если содержимое превышает высоту, появляется вертикальная прокрутка
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
              transformOrigin: "center center"
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
  
        {/* Панель с кнопками масштабирования и счетом игры справа */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingTop: "10px",
            alignItems: "center"
          }}
        >
          <button
            onClick={handleZoomIn}
            style={{ padding: "10px 20px", fontSize: "14px", width: "120px" }}
          >
            Приблизить
          </button>
          <button
            onClick={handleZoomOut}
            style={{ padding: "10px 20px", fontSize: "14px", width: "120px" }}
          >
            Отдалить
          </button>
  
          {/* Таблица счета игры */}
          <div style={{ marginTop: "20px", width: "100%" }}>
            <h3 style={{ fontSize: "16px", margin: "10px 0" }}>Счёт игры</h3>
            <table
              style={{
                margin: "0 auto",
                borderCollapse: "collapse",
                width: "90%"
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "5px" }}>Игрок</th>
                  <th style={{ border: "1px solid #ccc", padding: "5px" }}>Очки</th>
                </tr>
              </thead>
              <tbody>
                {gameState.players.map((player) => (
                  <tr key={player.playerId}>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                      {player.name}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                      {gameState.scores && gameState.scores[player.playerId] !== undefined
                        ? gameState.scores[player.playerId]
                        : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Кнопки выбора типа миплов */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px"
            }}
          >
            <button
              onClick={() => setSelectedMeepleType("подданные")}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedMeepleType === "подданные" ? "#555" : "#ccc",
                color: selectedMeepleType === "подданные" ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              подданные ({myMeeples})
            </button>
            <button
              onClick={() => setSelectedMeepleType("аббаты")}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedMeepleType === "аббаты" ? "#555" : "#ccc",
                color: selectedMeepleType === "аббаты" ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              аббаты ({myAbbats})
            </button>
          </div>
        </div>
      </div>
      
      {/* Блок с кнопками управления ходом, поворотом, отменой действия и карточкой */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
          gap: "10px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px"
          }}
        >
          <button
            onClick={handleRotateImage}
            disabled={!isMyTurn}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: !isMyTurn ? "not-allowed" : "pointer"
            }}
          >
            Повернуть
          </button>
          <button
            onClick={handleCancelAction}
            disabled={!isMyTurn || !gameState.currentMoveMade}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor:
                !isMyTurn || !gameState.currentMoveMade ? "not-allowed" : "pointer"
            }}
          >
            Отменить действие
          </button>
          <button
            onClick={handleEndTurn}
            disabled={!isMyTurn || !tilePlacedThisTurn}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor:
                !isMyTurn || !tilePlacedThisTurn ? "not-allowed" : "pointer"
            }}
          >
            Сделать ход
            </button>
              <button
                onClick={handleExit}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Выйти
              </button>
            </div>

  
        {isMyTurn && !tilePlacedThisTurn && (
          <div>
            <img
              src={`/tiles/${gameState.currentTileImage}`}
              alt="Текущее изображение для плиток"
              style={{
                width: "90px",      // фиксированная ширина
                height: "90px",     // фиксированная высота
                objectFit: "cover", // изображение масштабируется и обрезается по центру
                transform: `rotate(${gameState.imageRotation}deg)`,
                transition: "transform 0.3s ease",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GamePage;
