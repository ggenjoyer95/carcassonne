# Carcassonne

Веб‑приложение для игры в настольную игру каркассон
**https://carcboard.ru/**

## Функциональные возможности

- Регистрация и вход
- Создание и присоединение к игровому лобби
- Игровой процесс с подсчетом очков
- Сохранение состояний партий в базе данных и просмотр истории игр

## Технологии

- Фронтенд: React, React Router, Context API
- Бэкенд: Node.js, Express, Knex.js, PostgreSQL, bcrypt, jsonwebtoken
- Деплой: Render.com (backend + база данных), статический хостинг для фронтенда

## Запуск проекта

1. Склонировать репозиторий:
   ```bash
   git clone https://github.com/ggenjoyer95/carcassonne.git
   ```
2. Установить зависимости для сервера и клиента:
   ```bash
   cd carcassonne-server && npm install
   cd ../carcassonne-frontend && npm install
   ```
3. Настроить переменные окружения в `carcassonne-server/.env`
4. Запустить миграции и запустить:
   ```bash
   cd carcassonne-server && npm run migrate && npm run dev
   cd ../carcassonne-frontend && npm start
   ```

## Деплой

- Backend разворачивается на Render.com
- Frontend собирается командой `npm run build` и загружается в корень публичной папки хостинга под доменом `carcboard.ru`


