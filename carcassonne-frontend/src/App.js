import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import JoinGame from "./components/JoinGame";
import CreateGame from "./components/CreateGame";
import LobbyPage from "./components/LobbyPage";
import GamePage from "./components/GamePage";
import FinishGamePage from "./components/FinishGamePage";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { loadTileDefinitions } from "./data/tileAreas";
import { AuthProvider } from "./components/AuthContext";
import FindGame from "./components/FindGame";

function App() {
  const [definitionsLoaded, setDefinitionsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        await loadTileDefinitions();
        setDefinitionsLoaded(true);
      } catch (error) {
        console.error("Ошибка загрузки определений плиток:", error);
        setLoadError(
          "Не удалось загрузить данные игры. Пожалуйста, обновите страницу."
        );
      }
    };

    loadDefinitions();
  }, []);

  if (!definitionsLoaded && !loadError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Загрузка данных игры...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <p style={{ color: "red" }}>{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>Добро пожаловать в Carcassonne!</h1>
                <p></p>
                <Link to="/join">
                  <button
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    Присоединиться по ID
                  </button>
                </Link>
                <Link to="/create">
                  <button
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    Создать игру
                  </button>
                </Link>
                <Link to="/find">
                  <button
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Найти игру
                  </button>
                </Link>
              </div>
            }
          />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/find" element={<FindGame />} />
          <Route path="/lobby/:gameId" element={<LobbyPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/finish" element={<FinishGamePage />} />
          {}
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
