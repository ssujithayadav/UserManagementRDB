const { Sequelize, DataTypes } = require('sequelize');
const validator = require('validator');
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');

const sequelize = new Sequelize('sys', 'root', '8919148082', {
  host: 'localhost',
  dialect: 'mysql',
});

const passwordSchema = new passwordValidator();
passwordSchema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces();

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isAlphanumeric: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstname: {
    type: DataTypes.STRING,
    defaultValue: "notProvided",
    allowNull: true,
    unique: false,
    validate: {
      isAlphanumeric: true,
    }, 
  },
  lastname:{
    type: DataTypes.STRING,
    defaultValue: "notProvided",
    allowNull: true,
    unique: false,
    validate: {
      isAlphanumeric: true,
    },
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull:true,
  }
 
});

User.beforeCreate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

sequelize.sync({ force: false })
  .then(() => {
    console.log('MySQL connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

 

module.exports = {
  User,
  passwordSchema,
};


