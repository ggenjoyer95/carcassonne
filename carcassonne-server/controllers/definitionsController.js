const tileDefinitions = require("../data/tileDefinitions");

const getTileDefinitions = (req, res) => {
  try {
    return res.status(200).json(tileDefinitions);
  } catch (error) {
    console.error("Ошибка при отправке определений плиток:", error);
    return res.status(500).json({ errorMessage: "Внутренняя ошибка сервера" });
  }
};

module.exports = {
  getTileDefinitions,
};
