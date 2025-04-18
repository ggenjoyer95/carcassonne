import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/history/user/${user.username}`
        );
        if (!response.ok) {
          throw new Error("Ошибка получения истории игр");
        }
        const data = await response.json();

        const sorted = data.sort(
          (a, b) => new Date(b.played_at) - new Date(a.played_at)
        );
        setHistory(sorted);
      } catch (err) {
        console.error("Ошибка получения истории игр:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {}
      <h2>{user.username}</h2>

      <h3>История игр</h3>
      {loading && <p>Загрузка истории игр...</p>}
      {error && <p style={{ color: "red" }}>Ошибка: {error}</p>}
      {!loading &&
        !error &&
        (history.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Время игры
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Участники
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Победитель
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {}
                    {new Date(record.played_at).toLocaleString("ru-RU", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {record.participants.map((p) => p.username).join(", ")}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {record.winner}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>История игр пуста.</p>
        ))}
    </div>
  );
};

export default Profile;
