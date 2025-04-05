// carcassonne-server/data/tileDefinitions.js

/**
 * Определения областей плиток для игры Carcassonne
 * Содержит данные об областях плиток, включая их тип и координаты полигонов
 * для визуального отображения на фронтенде
 */
const tileDefinitions = {
  photo1: [
    {
      name: "cityArea",
      type: "city",
      // Верхняя область – город (например, верхняя 40% плитки)
      polygon: [
        [0.0, 0.0],
        [1.0, 0.0],
        [1.0, 0.4],
        [0.0, 0.4]
      ]
    },
    {
      name: "roadArea",
      type: "road",
      // Центральная область – дорога
      polygon: [
        [0.3, 0.4],
        [0.7, 0.4],
        [0.7, 0.6],
        [0.3, 0.6]
      ]
    },
    {
      name: "fieldArea",
      type: "field",
      // Нижняя область – поле
      polygon: [
        [0.0, 0.6],
        [1.0, 0.6],
        [1.0, 1.0],
        [0.0, 1.0]
      ]
    }
  ],
  photo2: [
    {
      name: "fieldArea",
      type: "field",
      // Верхняя область – поле
      polygon: [
        [0.0, 0.0],
        [1.0, 0.0],
        [1.0, 0.5],
        [0.0, 0.5]
      ]
    },
    {
      name: "roadArea",
      type: "road",
      // Нижняя область – дорога
      polygon: [
        [0.4, 0.5],
        [0.6, 0.5],
        [0.6, 1.0],
        [0.4, 1.0]
      ]
    }
  ]
};

module.exports = tileDefinitions;