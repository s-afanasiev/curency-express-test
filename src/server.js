require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = require('./swagger-options');
const sequelize = require('./db');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';

app.use(cors());
app.use(bodyParser.json());

//@ Инициализация базы данных
sequelize.sync();

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

//@ Регистрация нового пользователя
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  //@ Проверка, существует ли пользователь
  // const existingUser = users.find((user) => user.username === username);
  // if (existingUser) {
  //   return res.status(400).json({ message: 'User already registered' });
  // }
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ message: 'User already registered' });
  }

  //@ Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  //@ Создание нового пользователя
  // const newUser = { id: users.length + 1, username, password: hashedPassword };
  // users.push(newUser);
  const newUser = await User.create({ username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
});

// Маршрут для аутентификации
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // const user = users.find((u) => u.username === username && u.password === password);
  const user = await User.findOne({ where: { username } });

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
