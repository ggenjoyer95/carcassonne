// Начальное состояние tileAreas (пустой объект)
export let tileAreas = {};

/**
 * Функция для загрузки определений областей плиток с сервера
 * Вызывается при запуске приложения
 * @returns {Object} Объект с определениями областей плиток
 */
export const loadTileDefinitions = async () => {
  const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/tile-definitions`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Не удалось загрузить определения плиток');
  }
  const definitions = await response.json();
  tileAreas = definitions;
  console.log('Определения плиток успешно загружены');
  return tileAreas;
};
