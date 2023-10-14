const express = require('express');
const router = express.Router();
const { User, passwordSchema } = require('./user');
const { verifyToken, generateToken, token } = require('./auth');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');


router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    if (!passwordSchema.validate(password)) {
      return res.status(400).json({ message: 'Password doesn\'t meet the required criteria. Please choose a strong password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    const token = generateToken(username);
    res.json({ token, message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(username);
    res.json({ token, message: 'User authenticated successfully' });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/users/me', verifyToken, async (req, res) => {
  const username = req.userId;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.destroy({ where: { username } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const invalidatedTokens = new Set();
router.post('/signout', verifyToken, async (req, res) => {
  try {
    const username = req.userId;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    invalidatedTokens.add(token);
    res.json({ message: 'User logged out successfully' });
    
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/users/me', verifyToken, async (req, res) => {
  const { firstname, lastname } = req.body;
  const username = req.userId;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstname = firstname;
    user.lastname = lastname;
    await user.save();

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = {
  router,
  invalidatedTokens
};

