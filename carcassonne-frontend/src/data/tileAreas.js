// carcassonne-frontend/src/data/tileAreas.js

// Начальное состояние tileAreas (пустой объект)
export let tileAreas = {};

/**
 * Функция для загрузки определений областей плиток с сервера
 * Вызывается при запуске приложения
 * @returns {Object} Объект с определениями областей плиток
 */
export const loadTileDefinitions = async () => {
  // Получаем URL API из переменных окружения или используем значение по умолчанию
  const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/tile-definitions`;
  
  // Выполняем запрос к API
  const response = await fetch(apiUrl);
  
  // Проверяем успешность запроса
  if (!response.ok) {
    throw new Error('Не удалось загрузить определения плиток');
  }
  
  // Получаем данные из ответа
  const definitions = await response.json();
  
  // Сохраняем определения в переменную tileAreas
  tileAreas = definitions;
  
  console.log('Определения плиток успешно загружены');
  return tileAreas;
};

/**
 * Рассчитывает позицию мипла на основе имени области и типа плитки
 * @param {string} areaName - Имя области (например, "cityArea")
 * @param {string} tileType - Тип плитки (например, "photo1")
 * @param {number} tileSize - Размер плитки в пикселях (по умолчанию 80)
 * @param {number} rotation - Угол поворота плитки в градусах (по умолчанию 0)
 * @returns {Object} - Объект с координатами x и y для размещения мипла
 */
export function calculateMeeplePosition(areaName, tileType, tileSize = 80, rotation = 0) {
  const areas = tileAreas[tileType] || [];
  const area = areas.find(a => a.name === areaName);
  
  if (!area || !area.polygon || area.polygon.length === 0) {
    // Если область не найдена, возвращаем центр плитки
    return { x: tileSize / 2, y: tileSize / 2 };
  }
  
  // Рассчитываем центр полигона
  const centerX = area.polygon.reduce((sum, [x]) => sum + x, 0) / area.polygon.length * tileSize;
  const centerY = area.polygon.reduce((sum, [_, y]) => sum + y, 0) / area.polygon.length * tileSize;
  
  // Если нет поворота, возвращаем напрямую
  if (rotation === 0) {
    return { x: centerX, y: centerY };
  }
  
  // Применяем трансформацию поворота
  const radians = (rotation * Math.PI) / 180;
  const centerOfTile = tileSize / 2;
  
  // Переводим в начало координат, поворачиваем, затем переводим обратно
  const rotatedX =
    (centerX - centerOfTile) * Math.cos(radians) -
    (centerY - centerOfTile) * Math.sin(radians) +
    centerOfTile;
    
  const rotatedY =
    (centerX - centerOfTile) * Math.sin(radians) +
    (centerY - centerOfTile) * Math.cos(radians) +
    centerOfTile;
  
  return { x: rotatedX, y: rotatedY };
}
