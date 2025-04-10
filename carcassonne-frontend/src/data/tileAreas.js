export let tileAreas = {};

export const loadTileDefinitions = async () => {
  const apiUrl = `${
    process.env.REACT_APP_API_URL || "http://localhost:8080"
  }/api/tile-definitions`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Не удалось загрузить определения плиток");
  }
  const definitions = await response.json();
  tileAreas = definitions;
  console.log("Определения плиток успешно загружены");
  return tileAreas;
};
