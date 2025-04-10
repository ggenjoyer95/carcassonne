import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { AuthContext } from "../components/AuthContext";

function CreateGame() {
  const { user } = useContext(AuthContext);
  const [playerName, setPlayerName] = useState(user?.username || "");
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    try {
      const createRes = await fetch(
        `${process.env.REACT_APP_API_URL}/game/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!createRes.ok) throw new Error("Ошибка при создании игры");
      const { gameId } = await createRes.json();

      Cookies.set(`creator_${gameId}`, "true");

      const joinRes = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "1234", playerName }),
        }
      );
      if (!joinRes.ok) {
        const err = await joinRes.json();
        throw new Error(err.errorMessage || "Ошибка при подключении к игре");
      }
      const joinData = await joinRes.json();

      if (joinData.token) {
        localStorage.setItem("jwt", joinData.token);
      }
      navigate(`/lobby/${gameId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{ margin: "40px auto", maxWidth: "400px", textAlign: "center" }}
    >
      <h2>Создать игру</h2>

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
        onClick={handleCreateGame}
        disabled={!playerName.trim()}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: playerName.trim() ? "pointer" : "not-allowed",
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
