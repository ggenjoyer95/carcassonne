import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function FinishGamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(location.state || null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFinalState = async () => {
      try {
        const id = gameState?.gameId || "";
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/game/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setGameState(data);
        } else {
          setError("Ошибка получения финального состояния игры");
        }
      } catch (err) {
        setError("Ошибка соединения с сервером");
      }
    };

    if (!gameState || !gameState.scores) {
      fetchFinalState();
    }
  }, [gameState]);

  if (!gameState) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        Загрузка финального состояния игры...
      </div>
    );
  }

  const scores = gameState.scores || {};
  const players = gameState.players || [];

  let maxScore = -Infinity;
  players.forEach((player) => {
    const playerScore = scores[player.playerId] || 0;
    if (playerScore > maxScore) {
      maxScore = playerScore;
    }
  });
  const winners = players.filter(
    (player) => (scores[player.playerId] || 0) === maxScore
  );
  let winnerText = "";
  if (winners.length === 1) {
    winnerText = winners[0].name;
  } else if (winners.length > 1) {
    winnerText = winners.map((player) => player.name).join(", ");
  } else {
    winnerText = "Не определен";
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Игра завершена!</h2>
      <h3>Победитель: {winnerText}</h3>
      <div style={{ marginTop: "20px", display: "inline-block" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "5px" }}>
                Игрок
              </th>
              <th style={{ border: "1px solid #ccc", padding: "5px" }}>Очки</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.playerId}>
                <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                  {player.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                  {scores[player.playerId] !== undefined
                    ? scores[player.playerId]
                    : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          На главную
        </button>
      </div>
    </div>
  );
}

export default FinishGamePage;
