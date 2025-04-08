const fs = require('fs');
const path = require('path');

// Определяем пути к файлам
const updatedJsonPath = path.join(__dirname, 'tileDefinitions_updated.json');
const outputJsPath = path.join(__dirname, 'tileDefinitions.js');

// Читаем содержимое JSON-файла
let data = fs.readFileSync(updatedJsonPath, 'utf8').trim();

// Если данные обёрнуты в кавычки, убираем их
if ((data.startsWith('"') && data.endsWith('"')) || (data.startsWith("'") && data.endsWith("'"))) {
  // Убираем первую и последнюю кавычку
  data = data.substring(1, data.length - 1);
  // Отменяем экранирование кавычек внутри строки
  data = data.replace(/\\"/g, '"').replace(/\\'/g, "'");
}

let tileDefinitions;
try {
  tileDefinitions = JSON.parse(data);
} catch (e) {
  console.error("Ошибка парсинга JSON данных:", e);
  process.exit(1);
}

// Формируем содержимое JS-файла
const jsContent = `const tileDefinitions = ${JSON.stringify(tileDefinitions, null, 2)};

module.exports = tileDefinitions;
`;

// Записываем содержимое в tileDefinitions.js
fs.writeFileSync(outputJsPath, jsContent, 'utf8');
console.log('tileDefinitions.js успешно обновлён с исправленными кавычками.');