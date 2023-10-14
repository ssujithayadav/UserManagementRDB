const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const {User,passwordSchema} = require('./user');
const routes = require('./routes');
const { generateToken, verifyToken } = require('./auth');

const app = express();
app.use(express.json());


const sequelize = new Sequelize('sys', 'root', '8919148082', {
  host: 'localhost',
  dialect: 'mysql',
});


const UserModel = new User(sequelize, DataTypes);


sequelize.sync({ force: true })
  .then(() => {
    console.log('MySQL Synced.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

app.use('/', routes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
