const jwt = require('jsonwebtoken');
const User = require('./user');
const {invalidatedTokens} = require('./routes')

const generateToken = (userId) => {
  return jwt.sign({ userId }, 'your-secret-key', { expiresIn: '1h' });
};



const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }
 
  if (invalidatedTokens.has(token)) {
    return res.status(401).json({ error: 'Invalid token. Please sign in again.' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
};

