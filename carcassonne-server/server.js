const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Routes
const gameRoutes = require("./routes/gameRoutes");
const definitionsRoutes = require("./routes/definitionsRoutes");

app.use("/game", gameRoutes);
app.use("/api", definitionsRoutes);

// Функция для задержки выполнения
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Database connection and migrations
async function setupDatabase() {
  let retries = 5;
  while (retries) {
    try {
      console.log("Attempting to connect to database...");
      
      // Добавляем задержку перед подключением к базе данных
      // Это даст базе данных время для инициализации
      await sleep(3000);
      
      // Run migrations
      await db.migrate.latest();
      console.log("Database migrations completed successfully");
      
      // Start the server
      app.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
      });
      
      return;
    } catch (error) {
      console.error("Error setting up database:", error);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      
      if (retries === 0) {
        console.error("Failed to connect to database after multiple attempts");
        process.exit(1);
      }
      
      // Ждем перед следующей попыткой
      await sleep(5000);
    }
  }
}

// Initialize the application
setupDatabase();
