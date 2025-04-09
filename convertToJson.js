const fs = require('fs');
const path = require('path');

// Импортируем определения из JS файла
const tileDefinitions = require('./carcassonne-server/data/tileDefinitions');

// Преобразуем объект в строку JSON с отступами (2 пробела)
const jsonString = JSON.stringify(tileDefinitions, null, 2);

// Определяем путь для выходного файла JSON
const outputPath = path.join(__dirname, 'tileDefinitions.json');

// Записываем строку JSON в файл
fs.writeFileSync(outputPath, jsonString, 'utf8');

console.log(`Файл успешно сконвертирован и сохранён по пути: ${outputPath}`);