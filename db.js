const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('your_database', 'your_username', 'your_password', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;

//@ Migrations:
//@ npx sequelize-cli migration:generate --name create-users-table

//@ migration to create users table:
//@ npx sequelize-cli db:migrate
