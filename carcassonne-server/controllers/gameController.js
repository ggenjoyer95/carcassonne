const { validateTilePlacement } = require('../helpers/matchRules');
const { findAreaByName } = require('../helpers/tileSegments');
const { calculateScores } = require('../helpers/featureScoring');

const games = {};
const jwt = require("jsonwebtoken");

function addNeighbors(board, x, y) {
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  directions.forEach(([dx, dy]) => {
    const key = `${x + dx},${y + dy}`;
    if (!(key in board)) {
      board[key] = null;
    }
  });
}

const joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerName } = req.body;

    // Find game in database
    const game = await Game.findById(gameId);
    
    if (!game) {
      console.log(`Ошибка: Игра с ID ${gameId} не найдена`);
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }

    const newPlayer = {
      playerId: `player${game.players.length + 1}`,
      name: playerName,
      meeples: 7,   // подданные
      abbats: 1     // аббаты
    };
    

    game.players.push(newPlayer);

    // Save changes to database
    await game.save();

    console.log(
      `Игрок "${playerName}" подключился к игре ${gameId}. Всего игроков: ${game.players.length}`
    );

    const token = jwt.sign(
      { playerId: newPlayer.playerId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token, players: game.players });
  } catch (error) {
    console.error("Error joining game:", error);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

const startGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);
    if (!game) {
      console.log(`Ошибка: Игра с ID ${gameId} не найдена`);
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }
    
    // Присвоение цветов игрокам
    const availableColors = ["yellow", "red", "green", "blue", "black"];
    availableColors.sort(() => Math.random() - 0.5);
    
    if (game.players.length > availableColors.length) {
      return res.status(400).json({ errorMessage: "Слишком много игроков для доступных цветов" });
    }
    
    game.players.forEach((player, index) => {
      player.color = availableColors[index];
    });
    
    // Инициализация игрового поля
    const images = ["photo1.png", "photo2.png"];
    const chosenImage = images[Math.floor(Math.random() * images.length)];
    
    game.board = {};
    game.board["0,0"] = {
      tile: "image",
      image: chosenImage, // например, "photo1.png"
      type: chosenImage.replace('.png', ''),
      offsetX: 40,
      offsetY: 40,
      rotation: 0,
      owner: "system",
    };


    
    game.currentTileImage = chosenImage;
    
    // Добавляем соседей к начальной плитке
    addNeighbors(game.board, 0, 0);
    
    game.currentMoveMade = false;
    game.currentTurn = game.players[0].playerId;
    game.imageRotation = 0;
    game.status = "active";
    game.remainingCards = 20;
    
    await game.save();
    
    console.log(`Игра ${gameId} началась! Осталось ${game.remainingCards} карт.`);
    return res.status(200).json(game);
  } catch (error) {
    console.error("Error starting game:", error);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

const makeMove = async (req, res) => {
  try {
    const { gameId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;
    if (game.currentTurn !== playerId) {
      return res.status(403).json({ errorMessage: "Сейчас не ваш ход" });
    }
    const player = game.players.find((p) => p.playerId === playerId);
    if (!player) {
      return res.status(404).json({ errorMessage: "Игрок не найден" });
    }
    // Логика завершения хода – например, переключение текущего игрока
    let currentIndex = game.players.findIndex((p) => p.playerId === playerId);
    let nextIndex = (currentIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextIndex].playerId;
    await game.save();
    console.log(`Игрок ${player.name} сделал ход. Цвет: ${player.color}`);
    return res.status(200).json(game);
  } catch (err) {
    console.error("Ошибка в makeMove:", err);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

const getGameState = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Find game in database
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }

    return res.status(200).json(game);
  } catch (error) {
    console.error("Error getting game state:", error);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

const { getEffectiveSides, matchRules } = require("../helpers/matchRules");
const Game = require("../models/gameModel");

// Create a new game
const createGame = async (req, res) => {
  try {
    const gameId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newGame = new Game(gameId);
    
    // Save the game to the database
    const saved = await newGame.save();
    
    if (!saved) {
      return res.status(500).json({ errorMessage: "Ошибка при создании игры" });
    }
    
    console.log(`Игра создана: ${gameId} (Ожидание игроков)`);
    
    res.status(200).json({ gameId });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ errorMessage: "Внутренняя ошибка сервера" });
  }
};

const leaveGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;

    // Считываем игру из базы
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }

    // Ищем игрока в массиве players
    const playerIndex = game.players.findIndex(
      (player) => player.playerId === playerId
    );
    if (playerIndex === -1) {
      return res
        .status(404)
        .json({ errorMessage: "Игрок не найден в этой игре." });
    }

    // Удаляем игрока
    const [removedPlayer] = game.players.splice(playerIndex, 1);
    console.log(`Игрок ${removedPlayer.name} покинул игру ${gameId}.`);

    // Если после удаления не осталось игроков – можно удалить игру или сменить статус
    if (game.players.length === 0) {
      // либо удаляем из базы, либо меняем статус на 'finished'
      // await db('games').where('game_id', gameId).del(); // пример удаления
      console.log(`Игра ${gameId} удалена, так как все игроки покинули лобби.`);
    } else {
      // Сохраняем изменения
      await game.save();
    }

    return res.status(200).json({ message: "Вы успешно покинули игру." });
  } catch (err) {
    console.error("Ошибка в leaveGame:", err);
    return res.status(401).json({ errorMessage: "Неверный токен авторизации." });
  }
};


/**
 * Функция проверки сопоставления сторон для одного соседа.
 * @param {Object} neighborTile – объект соседней плитки.
 * @param {string} newTileType – тип новой плитки (например, "photo1.png" или "photo2.png").
 * @param {number} dx – смещение по x относительно соседа (например, -1, если сосед слева).
 * @param {number} dy – смещение по y относительно соседа.
 * @returns {boolean} – true, если сопоставление верно, иначе false.
 */
function canPlaceAdjacent(neighborTile, newTileType, dx, dy) {
  let neighborContactDirection;
  let newTileContactSide;
  if (dx === -1) {
    neighborContactDirection = "right";
    newTileContactSide = 1;
  } else if (dx === 1) {
    neighborContactDirection = "left";
    newTileContactSide = 3;
  } else if (dy === -1) {
    neighborContactDirection = "bottom";
    newTileContactSide = 2;
  } else if (dy === 1) {
    neighborContactDirection = "top";
    newTileContactSide = 4;
  }

  const neighborSides = getEffectiveSides(neighborTile);
  let neighborSideNumber;
  if (neighborContactDirection === "left")
    neighborSideNumber = neighborSides[0];
  else if (neighborContactDirection === "top")
    neighborSideNumber = neighborSides[1];
  else if (neighborContactDirection === "right")
    neighborSideNumber = neighborSides[2];
  else if (neighborContactDirection === "bottom")
    neighborSideNumber = neighborSides[3];

  const neighborType = neighborTile.image.includes("photo1")
    ? "photo1"
    : "photo2";
  const newType = newTileType.includes("photo1") ? "photo1" : "photo2";
  const allowed = matchRules[neighborType][newType][neighborSideNumber];
  return allowed.includes(newTileContactSide);
}

const placeTile = async (req, res) => {
  try {
    const { gameId } = req.params;
    let { x, y, offsetX, offsetY } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    // Преобразование координат
    const xNum = parseInt(x, 10);
    const yNum = parseInt(y, 10);
    if (isNaN(xNum) || isNaN(yNum)) {
      return res.status(400).json({ errorMessage: "Неверные координаты плитки" });
    }
    const key = `${xNum},${yNum}`;
    // Дополнительная проверка смещений (как в твоём коде)
    const offsetXNum = parseFloat(offsetX);
    const offsetYNum = parseFloat(offsetY);
    if (isNaN(offsetXNum) || isNaN(offsetYNum)) {
      return res.status(400).json({ errorMessage: "Неверные координаты для изображения" });
    }

    // Получаем игру из базы данных через модель Game
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;
    if (game.currentTurn !== playerId) {
      return res.status(403).json({ errorMessage: "Сейчас не ваш ход" });
    }
    if (game.currentMoveMade) {
      return res.status(400).json({ errorMessage: "Вы уже поставили плитку в этом ходе" });
    }
    if (!(key in game.board)) {
      console.log(`Ключ ${key} отсутствует в доске. Текущие ключи: ${Object.keys(game.board)}`);
      return res.status(400).json({ errorMessage: "Неверная позиция плитки" });
    }
    if (game.board[key] !== null) {
      return res.status(400).json({ errorMessage: "Плитка уже установлена" });
    }

    // Формируем объект нового тайла
    // Предположим, что в game.currentTileImage хранится имя типа: "photo1.png" или "photo2.png"
    // Формирование объекта нового тайла
    const newTile = {
      type: game.currentTileImage.replace('.png', ''),
      image: game.currentTileImage,
      rotation: game.imageRotation,
      offsetX: offsetXNum,
      offsetY: offsetYNum,
      owner: playerId,
      tile: "image",
      active: true   // <== Новое свойство, помечающее активную плитку
    };




    // Здесь вызываем функцию проверки установки тайла:
    if (!validateTilePlacement(game.board, newTile, xNum, yNum)) {
      return res.status(400).json({ errorMessage: "Неверное сопоставление граней. Ход недопустим." });
    }

    // Если проверка прошла, устанавливаем тайл
    game.board[key] = newTile;
    // Добавляем соседей для этой клетки (как в твоем предыдущем коде)
    addNeighbors(game.board, xNum, yNum);
    game.currentMoveMade = true;
    await game.save();
    console.log(`Игрок ${playerId} установил плитку на координатах (${xNum}, ${yNum})`);
    return res.status(200).json(game);
  } catch (err) {
    console.error("Ошибка в placeTile:", err);
    return res.status(401).json({ errorMessage: "Неверный токен авторизации." });
  }
};

const endTurn = async (req, res) => {
  try {
    const { gameId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;
    if (game.currentTurn !== playerId) {
      return res.status(403).json({ errorMessage: "Сейчас не ваш ход" });
    }
    if (!game.currentMoveMade) {
      return res.status(400).json({ errorMessage: "Вы не поставили плитку в этом ходе" });
    }

    game.remainingCards -= 1;
    if (game.remainingCards <= 0) {
      game.status = "finished";
      await game.save();
      console.log(`Игра ${gameId} завершена!`);
      const finalScores = calculateScores(game);
      console.log("Финальный счет:", finalScores);
      return res.status(200).json(game);
    }

    game.currentMoveMade = false;
    let currentIndex = game.players.findIndex((p) => p.playerId === playerId);
    let nextIndex = (currentIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextIndex].playerId;
    const images = ["photo1.png", "photo2.png"];
    game.currentTileImage = images[Math.floor(Math.random() * images.length)];

    // Сбросить флаг активности для всех плиток
    Object.keys(game.board).forEach(key => {
      if (game.board[key]) {
        game.board[key].active = false;
      }
    });

    await game.save();

    const currentScores = calculateScores(game);
    console.log("Текущий счет:", currentScores);

    console.log(
      `Ход игрока ${playerId} завершен. Следующий игрок: ${game.currentTurn}. Новое изображение: ${game.currentTileImage}`
    );
    return res.status(200).json(game);
  } catch (err) {
    console.error("Ошибка в endTurn:", err);
    return res.status(401).json({ errorMessage: "Неверный токен авторизации." });
  }
};




const TILE_SIZE = 80;

const placeMeeple = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { x, y, areaName, meepleType } = req.body;  // x,y – координаты плитки; areaName – имя области
    const token = req.headers.authorization?.split(" ")[1];

    // Получаем игру из базы данных
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;

    // Проверяем, что сейчас ход этого игрока
    if (game.currentTurn !== playerId) {
      return res.status(403).json({ errorMessage: "Сейчас не ваш ход" });
    }

    // Находим игрока в списке игроков игры
    const player = game.players.find((p) => p.playerId === playerId);
    if (!player) {
      return res.status(404).json({ errorMessage: "Игрок не найден" });
    }

    // Проверяем, что координаты плитки корректны
    if (typeof x !== "number" || typeof y !== "number") {
      return res.status(400).json({ errorMessage: "Неверные координаты плитки" });
    }
    const key = `${x},${y}`;
    if (!(key in game.board)) {
      return res.status(400).json({ errorMessage: "Неверная позиция плитки" });
    }
    const tile = game.board[key];
    if (!tile) {
      return res.status(400).json({ errorMessage: "Плитка не установлена" });
    }
    if (tile.owner !== playerId) {
      return res.status(400).json({ errorMessage: "Эта плитка не принадлежит вам" });
    }
    if (tile.meeple) {
      return res.status(400).json({ errorMessage: "Мипл уже установлен на этой плитке" });
    }

    // Находим тип области по имени
    const area = findAreaByName(tile.type, areaName);
    
    if (!area) {
      return res.status(400).json({ errorMessage: "Указанная область не найдена" });
    }

    // Новая логика: проверка и обновление количества миплов
    if (meepleType === "аббаты") {
      if (player.abbats <= 0) {
        return res.status(400).json({ errorMessage: "Нет миплов данного типа" });
      }
      // Уменьшаем количество аббатов
      player.abbats--;
    } else { // по умолчанию "подданные"
      if (player.meeples <= 0) {
        return res.status(400).json({ errorMessage: "Нет миплов данного типа" });
      }
      // Уменьшаем количество подданных
      player.meeples--;
    }

    // Сохраняем только логическую информацию, без координат
    tile.meeple = {
      color: player.color,
      segment: areaName,
      segmentType: area.type,
      meepleType: req.body.meepleType // добавляем выбранный тип мипла
    };    

    await game.save();
    const meepleName = (meepleType === "аббаты") ? "мипл аббат" : "мипл подданный";
    console.log(
      `Игрок ${playerId} поставил ${meepleName} на плитке (${x},${y}) в сегменте "${areaName}" (тип: ${area.type})`
    );

    return res.status(200).json(game);
  } catch (err) {
    console.error("Ошибка в placeMeeple:", err);
    return res.status(401).json({ errorMessage: "Неверный токен авторизации." });
  }
};


const rotateImage = async (req, res) => {
  try {
    const { gameId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ errorMessage: "Игра не найдена" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (game.currentTurn !== decoded.playerId) {
      return res.status(403).json({ errorMessage: "Сейчас не ваш ход" });
    }
    game.imageRotation = (game.imageRotation + 90) % 360;
    await game.save();
    console.log(
      `Игрок ${decoded.playerId} повернул изображение. Новый угол: ${game.imageRotation}`
    );
    return res.status(200).json(game);
  } catch (err) {
    console.error("Ошибка в rotateImage:", err);
    return res.status(401).json({ errorMessage: "Неверный токен авторизации." });
  }
  };

  const cancelAction = async (req, res) => {
    try {
      const { gameId } = req.params;
      const token = req.headers.authorization?.split(" ")[1];
      const game = await Game.findById(gameId);
      if (!game) {
        return res.status(404).json({ errorMessage: "Игра не найдена" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const playerId = decoded.playerId;
      if (game.currentTurn !== playerId) {
        return res.status(403).json({ errorMessage: "Сейчас не ваш ход" });
      }
  
      // Ищем активную плитку с флагом active: true
      let activeTileKey = null;
      for (const key in game.board) {
        if (game.board[key] && game.board[key].active) {
          activeTileKey = key;
          break;
        }
      }
  
      if (!activeTileKey) {
        return res.status(400).json({ errorMessage: "Нет действия для отмены" });
      }
  
      const tile = game.board[activeTileKey];
      const player = game.players.find((p) => p.playerId === playerId);
      // Если на плитке установлен мипл, удаляем его
      if (tile.meeple) {
        // Если на плитке установлен мипл, увеличиваем количество миплов выбранного типа у игрока
        const type = tile.meeple.meepleType;
        if (type === "аббаты") {
          player.abbats++;
        } else {
          player.meeples++;
        }
        delete tile.meeple;
        console.log(`Отменён мипл на плитке ${activeTileKey} игроком ${playerId}`);
      } else {
        // Если мипла нет, отменяем установку плитки,
        // устанавливая значение клетки в null вместо удаления ключа
        game.board[activeTileKey] = null;
        game.currentMoveMade = false;
        console.log(`Отменена установка плитки на ${activeTileKey} игроком ${playerId}`);
      }
  
      await game.save();
      return res.status(200).json(game);
    } catch (err) {
      console.error("Ошибка в cancelAction:", err);
      return res.status(500).json({ errorMessage: "Internal server error" });
    }
  };
  
  

module.exports = {
  createGame,
  joinGame,
  startGame,
  getGameState,
  leaveGame,
  makeMove,
  placeTile,
  endTurn,
  placeMeeple,
  rotateImage,
  cancelAction,
};
