import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import JoinGame from "./components/JoinGame";
import CreateGame from "./components/CreateGame";
import LobbyPage from "./components/LobbyPage";
import GamePage from "./components/GamePage";
import FinishGamePage from "./components/FinishGamePage";
import { loadTileDefinitions } from "./data/tileAreas";

function App() {
  const [definitionsLoaded, setDefinitionsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Загружаем определения плиток при запуске приложения
  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        // Вызываем функцию загрузки определений
        await loadTileDefinitions();
        setDefinitionsLoaded(true);
      } catch (error) {
        console.error("Ошибка загрузки определений плиток:", error);
        setLoadError("Не удалось загрузить данные игры. Пожалуйста, обновите страницу.");
      }
    };

    loadDefinitions();
  }, []);

  // Показываем индикатор загрузки, пока определения загружаются
  if (!definitionsLoaded && !loadError) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Загрузка данных игры...</p>
      </div>
    );
  }

  // Показываем сообщение об ошибке, если загрузка не удалась
  if (loadError) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <p style={{ color: 'red' }}>{loadError}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h1>Добро пожаловать в Carcassonne!</h1>
              <p>Этот интерфейс создаётся с нуля.</p>
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
                  }}
                >
                  Создать игру
                </button>
              </Link>
            </div>
          }
        />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/lobby/:gameId" element={<LobbyPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/finish" element={<FinishGamePage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
