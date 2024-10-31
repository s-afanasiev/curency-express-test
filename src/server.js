require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = require('./swagger-options');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';

app.use(cors());
app.use(bodyParser.json());

const swaggerDocs = swaggerJsDoc(swaggerOptions);

//@ Подключаем Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//@ Простая БД пользователей
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

//@ генерация токена
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: '1h',
  });
};

// Маршрут для аутентификации
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Middleware проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  //@ Не авторизован
  if (!token) return res.sendStatus(401); 

  jwt.verify(token, SECRET_KEY, (err, user) => {
    //@ Запрещено
    if (err) return res.sendStatus(403);
    //@ Сохраняем информацию о пользователе в запросе
    req.user = user;
    next();
  });
};

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Возвращает защищенный ресурс
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный ответ
 *       401:
 *         description: Не авторизован
 */
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

//@ Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
