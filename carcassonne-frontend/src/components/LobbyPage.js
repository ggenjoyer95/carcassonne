import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function LobbyPage() {
  const { gameId } = useParams();
  const [players, setPlayers] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const creatorCookie = Cookies.get(`creator_${gameId}`);
    setIsCreator(creatorCookie === "true");

    const fetchLobby = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/game/${gameId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const active = (data.players || []).filter((p) => !p.left);
          setPlayers(active);

          if (data.status === "active") {
            navigate(`/game/${gameId}`);
          }
        } else if (response.status === 404) {
          Cookies.remove(`creator_${gameId}`);
          navigate("/");
        } else {
          console.error("Ошибка при получении данных лобби");
        }
      } catch (err) {
        console.error("Ошибка соединения с сервером:", err);
      }
    };

    const intervalId = setInterval(fetchLobby, 2000);
    fetchLobby();

    return () => clearInterval(intervalId);
  }, [gameId, navigate]);

  const handleStartGame = async () => {
    if (players.length < 2 || players.length > 5) {
      setError("Игра может быть начата только если в лобби от 2 до 5 человек.");
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.errorMessage || "Ошибка при старте игры.");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером.");
    }
  };

  const handleLeaveLobby = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${gameId}/leave`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.deleted) {
        Cookies.remove(`creator_${gameId}`);
      }
      navigate("/");
    } catch (err) {
      setError("Ошибка при выходе из лобби.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Лобби игры: {gameId}</h2>
      <h3>Подключённые игроки:</h3>
      <ul>
        {players.map((player) => (
          <li key={player.playerId}>{player.name}</li>
        ))}
      </ul>
      {isCreator && (
        <button
          onClick={handleStartGame}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Начать игру
        </button>
      )}
      <button
        onClick={handleLeaveLobby}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#FF4D4D",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Выйти из лобби
      </button>
      {error && <p style={{ marginTop: "10px", color: "red" }}>{error}</p>}
    </div>
  );
}

export default LobbyPage;
