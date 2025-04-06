FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Устанавливаем переменные окружения по умолчанию
ENV NODE_ENV=production
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=carcassonne
ENV DB_PASSWORD=carcassonne
ENV DB_NAME=carcassonne

EXPOSE 8080

# Используем скрипт ожидания вместо прямого запуска
CMD ["./wait-for-db.sh", "postgres", "npm", "start"]