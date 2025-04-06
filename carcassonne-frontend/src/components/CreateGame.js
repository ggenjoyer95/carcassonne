import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function CreateGame() {
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const gameId = data.gameId;
        Cookies.set(`creator_${gameId}`, "true");
        const joinResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/game/${gameId}/join`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: "1234", playerName }),
          }
        );

        if (joinResponse.ok) {
          const joinData = await joinResponse.json();
          if (joinData.token) {
            localStorage.setItem("jwt", joinData.token);
          }
          navigate(`/lobby/${gameId}`);
        } else {
          console.error("Ошибка при подключении к игре");
        }
      } else {
        console.error("Ошибка при создании игры");
      }
    } catch (err) {
      console.error("Ошибка соединения с сервером:", err);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Создать игру</h2>
      <div style={{ marginBottom: "10px" }}>
        <label>Ваше имя:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
          maxLength="12"
          style={{ marginLeft: "10px", padding: "5px" }}
        />
      </div>
      <button
        onClick={handleCreateGame}
        disabled={!playerName.trim()}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: playerName.trim() ? "#007BFF" : "#CCCCCC",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Сгенерировать ID
      </button>
    </div>
  );
}

export default CreateGame;
