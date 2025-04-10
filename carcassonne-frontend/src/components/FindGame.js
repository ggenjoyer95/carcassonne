import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

function FindGame() {
  const { user } = useContext(AuthContext);
  const stored =
    user?.username || localStorage.getItem("findGamePlayerName") || "";
  const [playerName, setPlayerName] = useState(stored);
  const [nameConfirmed, setNameConfirmed] = useState(
    Boolean(user || localStorage.getItem("findGamePlayerName"))
  );
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadActive = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/game/active`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.games)) {
        list = data.games;
      } else {
        console.warn("Unexpected /game/active response:", data);
      }
      setGames(list);
    } catch (err) {
      console.error("Ошибка при загрузке активных игр:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!nameConfirmed) return;
    loadActive();
    const id = setInterval(loadActive, 5000);
    return () => clearInterval(id);
  }, [nameConfirmed]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      if (!user) {
        localStorage.setItem("findGamePlayerName", playerName.trim());
      }
      setNameConfirmed(true);
    }
  };

  const handleJoin = async (gameId) => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/game/${gameId}/join`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "1234", playerName }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      alert(data.errorMessage || "Не удалось подключиться");
    } else {
      if (data.token) localStorage.setItem("jwt", data.token);
      navigate(`/lobby/${gameId}`);
    }
  };

  if (!nameConfirmed) {
    return (
      <div
        style={{ margin: "40px auto", maxWidth: "400px", textAlign: "center" }}
      >
        <h2>Ваше имя</h2>
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            maxLength="12"
            style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
          />
          <button
            type="submit"
            disabled={!playerName.trim()}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: playerName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Далее
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginLeft: "10px" }}>Доступные лобби</h2>
      {loading && <p>Загрузка активных лобби…</p>}
      {error && <p style={{ color: "red" }}>Ошибка: {error}</p>}
      {!loading &&
        !error &&
        (games.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {games.map((g) => (
              <li key={g.gameId} style={{ margin: "8px 0" }}>
                <strong>{g.gameId}</strong> — {g.players} игроков{" "}
                <button
                  onClick={() => handleJoin(g.gameId)}
                  style={{ marginLeft: "10px" }}
                >
                  Подключиться
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginLeft: "10px" }}>
            В данный момент нет открытых лобби.
          </p>
        ))}
    </div>
  );
}

export default FindGame;
