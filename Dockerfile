# Используем официальный образ Node.js
FROM node:22.11-alpine3.19

# Устанавливаем рабочую директорию
WORKDIR /src

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
#RUN npm install && npm cache clean --force
RUN npm install

# Копируем остальные файлы приложения
COPY . .

# Указываем порт, который будет использоваться приложением
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]
