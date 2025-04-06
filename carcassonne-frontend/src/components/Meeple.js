import React from 'react';

const Meeple = ({ type, color, size = 15, style }) => {
  if (type === "аббаты") {
    // SVG-иконка, напоминающая корону
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={style}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5,16 L3,10 L6,10 L8,4 L10,10 L14,10 L16,4 L18,10 L21,10 L19,16 Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    );
  } else {
    // Иконка для типа "подданные" (по умолчанию)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={style}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    );
  }
};

export default Meeple;
