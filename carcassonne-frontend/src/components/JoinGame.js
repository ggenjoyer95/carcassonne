import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

function JoinGame() {
  const { user } = useContext(AuthContext);
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState(user?.username || "");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "1234", playerName }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setMessage(`Ошибка: ${data.errorMessage}`);
      } else {
        if (data.token) localStorage.setItem("jwt", data.token);
        navigate(`/lobby/${gameId}`);
      }
    } catch (err) {
      setMessage("Ошибка соединения с сервером.");
    }
  };

  return (
    <div
      style={{ margin: "40px auto", maxWidth: "400px", textAlign: "center" }}
    >
      <h2>Присоединение к игре</h2>
      <form onSubmit={handleJoin}>
        <div style={{ marginBottom: "10px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Game ID:
          </label>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            required
            style={{ padding: "5px", width: "100%" }}
          />
        </div>

        {}
        {!user && (
          <div style={{ marginBottom: "10px", textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Ваше имя:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
              maxLength="12"
              style={{ padding: "5px", width: "100%" }}
            />
          </div>
        )}

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
