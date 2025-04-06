import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinGame() {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: "1234", playerName }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.token) {
          localStorage.setItem("jwt", data.token);
        }

        navigate(`/lobby/${gameId}`);
      } else {
        const error = await response.json();
        setMessage(`Ошибка: ${error.errorMessage}`);
      }
    } catch (err) {
      setMessage("Ошибка соединения с сервером.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Присоединение к игре</h2>
      <form onSubmit={handleJoin}>
        <div style={{ marginBottom: "10px" }}>
          <label>Game ID:</label>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            required
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>
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
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Присоединиться
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "20px",
            color: message.startsWith("Ошибка") ? "red" : "green",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default JoinGame;
